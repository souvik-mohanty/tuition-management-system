package com.tuition.saas.auth.service;

import com.tuition.saas.common.exception.AuthException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

/**
 * Verifies Google Sign-In ID tokens (RS256, Google public keys): signature, expiry, issuer, that the token was
 * issued for OUR OAuth client (audience), and a verified email. No client secret is needed for this flow.
 */
@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);
    private static final String JWK_SET_URI = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> ISSUERS = Set.of("https://accounts.google.com", "accounts.google.com");

    public record GoogleIdentity(String subject, String email, String name) {
    }

    private final String clientId;
    private final NimbusJwtDecoder decoder;

    public GoogleAuthService(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId.trim(); // guards against stray whitespace/newlines from pasted env values
        log.info("Google sign-in client ID: {}", this.clientId.isBlank() ? "(NOT CONFIGURED)" : this.clientId);
        this.decoder = NimbusJwtDecoder.withJwkSetUri(JWK_SET_URI).build();
        OAuth2TokenValidator<Jwt> validator = token -> validate(token, this.clientId);
        this.decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator(), validator));
    }

    public GoogleIdentity verify(String idToken) {
        if (clientId.isBlank()) {
            throw new AuthException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured.");
        }
        Jwt jwt;
        try {
            jwt = decoder.decode(idToken);
        } catch (JwtException e) {
            log.warn("Google ID token rejected: {}", e.getMessage());
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Google sign-in failed. Please try again.", reasonCode(e.getMessage()));
        }
        return new GoogleIdentity(jwt.getSubject(), jwt.getClaimAsString("email"), jwt.getClaimAsString("name"));
    }

    /** Maps a decoder failure to a short code that is safe to show to the user. */
    static String reasonCode(String message) {
        String m = message == null ? "" : message.toLowerCase();
        if (m.contains("invalid audience")) return "audience_mismatch";
        if (m.contains("invalid issuer")) return "issuer_mismatch";
        if (m.contains("expired")) return "token_expired";
        if (m.contains("not verified") || m.contains("missing email")) return "email_not_verified";
        if (m.contains("signed jwt rejected") || m.contains("signature")) return "bad_signature";
        if (m.contains("jwk") || m.contains("connect") || m.contains("timed out") || m.contains("i/o error")) return "keys_unavailable";
        return "invalid_token";
    }

    static OAuth2TokenValidatorResult validate(Jwt jwt, String clientId) {
        String issuer = jwt.getClaimAsString("iss");
        if (issuer == null || !ISSUERS.contains(issuer)) {
            return failure("Invalid issuer");
        }
        List<String> aud = jwt.getAudience();
        if (clientId == null || clientId.isBlank() || aud == null || !aud.contains(clientId)) {
            return failure("Invalid audience");
        }
        if (jwt.getSubject() == null || jwt.getSubject().isBlank()) {
            return failure("Missing subject");
        }
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            return failure("Missing email");
        }
        Object verified = jwt.getClaim("email_verified");
        if (!(Boolean.TRUE.equals(verified) || "true".equals(verified))) {
            return failure("Email is not verified");
        }
        return OAuth2TokenValidatorResult.success();
    }

    private static OAuth2TokenValidatorResult failure(String description) {
        return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", description, null));
    }
}
