package com.tuition.saas.auth.service;

import com.tuition.saas.common.exception.AuthException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Verifies Firebase ID tokens (RS256, Google public keys) without needing a service-account secret:
 * signature, issuer, audience, expiry, an accepted sign-in method and a recent sign-in.
 * Accepted methods: phone (phone_number claim) and Google (verified email claim).
 */
@Service
public class FirebaseAuthService {

    private static final String JWK_SET_URI =
            "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    public static final String PROVIDER_PHONE = "phone";
    public static final String PROVIDER_GOOGLE = "google.com";

    public record FirebaseIdentity(String uid, String provider, String phoneNumber, String email) {

        public boolean isGoogle() {
            return PROVIDER_GOOGLE.equals(provider);
        }
    }

    private final NimbusJwtDecoder decoder;

    public FirebaseAuthService(
            @Value("${app.firebase.project-id}") String projectId,
            @Value("${app.auth.max-sign-in-age-seconds}") long maxSignInAgeSeconds) {
        this.decoder = NimbusJwtDecoder.withJwkSetUri(JWK_SET_URI).build();
        OAuth2TokenValidator<Jwt> validator = token -> validate(token, projectId, maxSignInAgeSeconds);
        this.decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer("https://securetoken.google.com/" + projectId), validator));
    }

    public FirebaseIdentity verify(String idToken) {
        Jwt jwt;
        try {
            jwt = decoder.decode(idToken);
        } catch (JwtException e) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Verification failed. Please sign in again.");
        }
        return new FirebaseIdentity(
                jwt.getSubject(),
                provider(jwt),
                jwt.getClaimAsString("phone_number"),
                jwt.getClaimAsString("email"));
    }

    static OAuth2TokenValidatorResult validate(Jwt jwt, String projectId, long maxSignInAgeSeconds) {
        List<String> aud = jwt.getAudience();
        if (aud == null || !aud.contains(projectId)) {
            return failure("Invalid audience");
        }
        if (jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            return failure("Missing subject");
        }
        String provider = provider(jwt);
        if (PROVIDER_PHONE.equals(provider)) {
            String phone = jwt.getClaimAsString("phone_number");
            if (phone == null || phone.isBlank()) {
                return failure("Missing phone number");
            }
        } else if (PROVIDER_GOOGLE.equals(provider)) {
            String email = jwt.getClaimAsString("email");
            if (email == null || email.isBlank()) {
                return failure("Missing email");
            }
            if (!Boolean.TRUE.equals(jwt.getClaim("email_verified"))) {
                return failure("Email is not verified");
            }
        } else {
            return failure("Unsupported sign-in method");
        }
        Instant authTime = toInstant(jwt.getClaim("auth_time"));
        if (authTime == null || authTime.isAfter(Instant.now().plusSeconds(60))
                || Duration.between(authTime, Instant.now()).getSeconds() > maxSignInAgeSeconds) {
            return failure("Sign-in is too old");
        }
        return OAuth2TokenValidatorResult.success();
    }

    private static String provider(Jwt jwt) {
        Object firebase = jwt.getClaim("firebase");
        if (firebase instanceof Map<?, ?> fb && fb.get("sign_in_provider") instanceof String p) {
            return p;
        }
        return null;
    }

    private static Instant toInstant(Object value) {
        if (value instanceof Instant i) return i;
        if (value instanceof Number n) return Instant.ofEpochSecond(n.longValue());
        return null;
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", description, null));
    }
}
