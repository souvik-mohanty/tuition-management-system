package com.tuition.saas.auth.service;

import com.tuition.saas.auth.dto.LoginResponse;
import com.tuition.saas.auth.dto.LoginResponse.MembershipDto;
import com.tuition.saas.auth.dto.LoginResponse.UserDto;
import com.tuition.saas.common.exception.AuthException;
import com.tuition.saas.tenant.entity.TuitionStatus;
import com.tuition.saas.tenant.entity.UserTuitionRole;
import com.tuition.saas.tenant.repository.UserTuitionRoleRepository;
import com.tuition.saas.user.entity.User;
import com.tuition.saas.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    // Firebase ID tokens live 1 hour; keep the replay marker at least that long.
    private static final Duration ID_TOKEN_REPLAY_WINDOW = Duration.ofHours(1);
    // DB role name -> role name exposed to clients. SUPER_ADMIN has no tuition-scoped app yet.
    private static final Map<String, String> CLIENT_ROLES = Map.of(
            "TUITION_ADMIN", "OWNER",
            "TEACHER", "TEACHER",
            "STUDENT", "STUDENT",
            "PARENT", "PARENT");

    private static final Map<String, String> ROLE_LABELS = Map.of(
            "OWNER", "an Owner/Admin", "TEACHER", "a Teacher", "STUDENT", "a Student", "PARENT", "a Parent");

    private final FirebaseAuthService firebase;
    private final GoogleAuthService google;
    private final JwtService jwtService;
    private final RedisAuthStore store;
    private final UserRepository users;
    private final UserTuitionRoleRepository memberships;
    private final Duration window;
    private final int ipMax;
    private final int phoneMax;

    public AuthService(FirebaseAuthService firebase, GoogleAuthService google, JwtService jwtService, RedisAuthStore store,
                       UserRepository users, UserTuitionRoleRepository memberships,
                       @Value("${app.auth.rate-limit.window-seconds}") long windowSeconds,
                       @Value("${app.auth.rate-limit.ip-max}") int ipMax,
                       @Value("${app.auth.rate-limit.phone-max}") int phoneMax) {
        this.firebase = firebase;
        this.google = google;
        this.jwtService = jwtService;
        this.store = store;
        this.users = users;
        this.memberships = memberships;
        this.window = Duration.ofSeconds(windowSeconds);
        this.ipMax = ipMax;
        this.phoneMax = phoneMax;
    }

    @Transactional(readOnly = true)
    public LoginResponse loginWithFirebase(String idToken, String clientIp) {
        enforce("ip:" + clientIp, ipMax);

        FirebaseAuthService.FirebaseIdentity identity = firebase.verify(idToken);

        rejectReplay(idToken);
        enforce("phone:" + identity.phoneNumber(), phoneMax);

        User user = users.findByPhone(identity.phoneNumber())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND,
                        "This number is not registered with any tuition center."));
        return buildLogin(user, null);
    }

    @Transactional(readOnly = true)
    public LoginResponse loginWithGoogle(String idToken, String role, String clientIp) {
        enforce("ip:" + clientIp, ipMax);

        GoogleAuthService.GoogleIdentity identity = google.verify(idToken);

        rejectReplay(idToken);
        enforce("email:" + identity.email().toLowerCase(), phoneMax);

        User user = users.findByEmailIgnoreCase(identity.email())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND,
                        "This Google account is not registered with any tuition center."));
        return buildLogin(user, role);
    }

    private void rejectReplay(String idToken) {
        if (!store.markIdTokenUsed(sha256(idToken), ID_TOKEN_REPLAY_WINDOW)) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "This sign-in was already used. Please try again.");
        }
    }

    /** role is the role the user chose at login (null = any); only memberships with that role are returned. */
    private LoginResponse buildLogin(User user, String role) {
        List<MembershipDto> active = memberships.findByUserId(user.getId()).stream()
                .filter(m -> m.getTuition().getStatus() == TuitionStatus.ACTIVE)
                .map(AuthService::toMembership)
                .filter(m -> m != null)
                .toList();
        if (active.isEmpty()) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You don't have access to any active tuition center.");
        }
        List<MembershipDto> selected = selectByRole(active, role);
        if (selected.isEmpty()) {
            throw new AuthException(HttpStatus.FORBIDDEN,
                    "This account is not registered as " + ROLE_LABELS.getOrDefault(role, role) + ".");
        }

        String accessToken = jwtService.issueAccessToken(user.getId());
        return new LoginResponse(
                accessToken,
                new UserDto(String.valueOf(user.getId()), user.getName(), user.getPhone(), user.getEmail()),
                selected);
    }

    static List<MembershipDto> selectByRole(List<MembershipDto> memberships, String role) {
        if (role == null) return memberships;
        return memberships.stream().filter(m -> m.role().equals(role)).toList();
    }

    public void logout(String jti) {
        if (jti != null) {
            store.revokeSession(jti);
        }
    }

    private void enforce(String key, int max) {
        if (store.incrementAttempts(key, window) > max) {
            throw new AuthException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Please try again later.");
        }
    }

    private static MembershipDto toMembership(UserTuitionRole m) {
        String role = CLIENT_ROLES.get(m.getRole().getName());
        if (role == null) return null;
        return new MembershipDto(String.valueOf(m.getTuition().getId()), m.getTuition().getName(), role);
    }

    private static String sha256(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
