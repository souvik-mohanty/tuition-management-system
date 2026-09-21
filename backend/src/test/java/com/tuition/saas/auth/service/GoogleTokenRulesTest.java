package com.tuition.saas.auth.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.List;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class GoogleTokenRulesTest {

    private static final String CLIENT_ID = "client-123.apps.googleusercontent.com";

    private static Jwt token(Consumer<Jwt.Builder> customize) {
        Instant now = Instant.now();
        Jwt.Builder b = Jwt.withTokenValue("t")
                .header("alg", "RS256")
                .issuer("https://accounts.google.com")
                .subject("google-sub-1")
                .audience(List.of(CLIENT_ID))
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .claim("email", "owner@example.com")
                .claim("email_verified", true);
        customize.accept(b);
        return b.build();
    }

    private static String error(Jwt jwt) {
        OAuth2TokenValidatorResult r = GoogleAuthService.validate(jwt, CLIENT_ID);
        return r.hasErrors() ? r.getErrors().iterator().next().getDescription() : null;
    }

    @Test
    void acceptsVerifiedEmailIssuedForOurClient() {
        assertFalse(GoogleAuthService.validate(token(b -> { }), CLIENT_ID).hasErrors());
    }

    @Test
    void acceptsBareAccountsGoogleComIssuer() {
        assertEquals(null, error(token(b -> b.issuer("accounts.google.com"))));
    }

    @Test
    void rejectsTokenIssuedForAnotherClient() {
        assertEquals("Invalid audience", error(token(b -> b.audience(List.of("someone-elses-client")))));
    }

    @Test
    void rejectsUntrustedIssuer() {
        assertEquals("Invalid issuer", error(token(b -> b.issuer("https://evil.example"))));
    }

    @Test
    void rejectsUnverifiedEmail() {
        assertEquals("Email is not verified", error(token(b -> b.claim("email_verified", false))));
    }

    @Test
    void rejectsMissingEmailVerifiedClaim() {
        assertEquals("Email is not verified", error(token(b -> b.claims(c -> c.remove("email_verified")))));
    }

    @Test
    void rejectsMissingEmail() {
        assertEquals("Missing email", error(token(b -> b.claims(c -> c.remove("email")))));
    }

    @Test
    void rejectsEverythingWhenClientIdIsNotConfigured() {
        assertEquals("Invalid audience", GoogleAuthService.validate(token(b -> { }), "").getErrors()
                .iterator().next().getDescription());
    }

    @Test
    void mapsFailuresToSafeReasonCodes() {
        assertEquals("audience_mismatch", GoogleAuthService.reasonCode("The token is invalid: Invalid audience"));
        assertEquals("issuer_mismatch", GoogleAuthService.reasonCode("Invalid issuer"));
        assertEquals("token_expired", GoogleAuthService.reasonCode("Jwt expired at 2026-01-01"));
        assertEquals("email_not_verified", GoogleAuthService.reasonCode("Email is not verified"));
        assertEquals("bad_signature", GoogleAuthService.reasonCode("Signed JWT rejected: Invalid signature"));
        assertEquals("keys_unavailable", GoogleAuthService.reasonCode("Couldn't retrieve remote JWK set: Connection refused"));
        assertEquals("invalid_token", GoogleAuthService.reasonCode(null));
    }
}
