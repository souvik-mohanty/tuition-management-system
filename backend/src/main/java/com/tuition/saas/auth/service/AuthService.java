package com.tuition.saas.auth.service;

import com.tuition.saas.auth.dto.LoginResponse;
import com.tuition.saas.auth.dto.LoginResponse.MembershipDto;
import com.tuition.saas.auth.dto.LoginResponse.UserDto;
import com.tuition.saas.common.exception.AuthException;
import com.tuition.saas.tenant.entity.Tuition;
import com.tuition.saas.tenant.entity.TuitionStatus;
import com.tuition.saas.tenant.entity.UserTuitionRole;
import com.tuition.saas.tenant.repository.TuitionRepository;
import com.tuition.saas.tenant.repository.UserTuitionRoleRepository;
import com.tuition.saas.user.entity.User;
import com.tuition.saas.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import java.util.Optional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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
    private final TuitionRepository tuitions;
    private final boolean demoMode;
    private final Duration window;
    private final int ipMax;
    private final int phoneMax;

    public AuthService(FirebaseAuthService firebase, GoogleAuthService google, JwtService jwtService, RedisAuthStore store,
                       UserRepository users, UserTuitionRoleRepository memberships,
                       TuitionRepository tuitions,
                       @Value("${app.demo.enabled:false}") boolean demoMode,
                       @Value("${app.auth.rate-limit.window-seconds}") long windowSeconds,
                       @Value("${app.auth.rate-limit.ip-max}") int ipMax,
                       @Value("${app.auth.rate-limit.phone-max}") int phoneMax) {
        this.firebase = firebase;
        this.google = google;
        this.jwtService = jwtService;
        this.store = store;
        this.users = users;
        this.memberships = memberships;
        this.tuitions = tuitions;
        this.demoMode = demoMode;
        if (demoMode) {
            log.warn("DEMO MODE is ON: any verified Google account can sign in as any role. Do not use with real data.");
        }
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

    @Transactional
    public LoginResponse loginWithGoogle(String idToken, String role, String clientIp) {
        enforce("ip:" + clientIp, ipMax);

        GoogleAuthService.GoogleIdentity identity = google.verify(idToken);

        rejectReplay(idToken);
        enforce("email:" + identity.email().toLowerCase(), phoneMax);

        Optional<User> existing = users.findByEmailIgnoreCase(identity.email());
        if (demoMode) {
            User user = existing.orElseGet(() -> users.save(User.builder()
                    .name(displayName(identity))
                    .email(identity.email().toLowerCase())
                    .build()));
            return buildDemoLogin(user, role == null ? "OWNER" : role);
        }
        User user = existing.orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND,
                "The Google account " + identity.email() + " is not registered with any tuition center."));
        return buildLogin(user, role);
    }

    /**
     * Demo only: the chosen role is granted on a tuition center regardless of stored memberships (real memberships
     * with that role are used when they exist), so every role's dashboard can be shown.
     */
    private LoginResponse buildDemoLogin(User user, String role) {
        List<UserTuitionRole> owned = memberships.findByUserId(user.getId()).stream()
                .filter(m -> m.getTuition().getStatus() == TuitionStatus.ACTIVE)
                .toList();
        List<MembershipDto> real = selectByRole(owned.stream().map(AuthService::toMembership)
                .filter(m -> m != null).toList(), role);
        if (!real.isEmpty()) {
            return respond(user, real);
        }
        Tuition tuition = owned.stream().map(UserTuitionRole::getTuition).findFirst()
                .or(() -> tuitions.findAll().stream().filter(t -> t.getStatus() == TuitionStatus.ACTIVE).findFirst())
                .orElseGet(() -> tuitions.save(Tuition.builder().name("Demo Tuition Center").build()));
        return respond(user, List.of(
                new MembershipDto(String.valueOf(tuition.getId()), tuition.getName(), role)));
    }

    private static String displayName(GoogleAuthService.GoogleIdentity identity) {
        if (identity.name() != null && !identity.name().isBlank()) return identity.name();
        String email = identity.email();
        return email.substring(0, email.indexOf('@') > 0 ? email.indexOf('@') : email.length());
    }

    private LoginResponse respond(User user, List<MembershipDto> selected) {
        String accessToken = jwtService.issueAccessToken(user.getId());
        return new LoginResponse(
                accessToken,
                new UserDto(String.valueOf(user.getId()), user.getName(), user.getPhone(), user.getEmail()),
                selected);
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

        return respond(user, selected);
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
