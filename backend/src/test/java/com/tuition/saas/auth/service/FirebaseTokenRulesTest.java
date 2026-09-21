package com.tuition.saas.auth.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Map;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FirebaseTokenRulesTest {

    private static final String PROJECT = "demo-project";
    private static final long MAX_AGE = 300;

    private static Jwt token(String provider, Consumer<Jwt.Builder> customize) {
        Instant now = Instant.now();
        Jwt.Builder b = Jwt.withTokenValue("t")
                .header("alg", "RS256")
                .subject("uid-1")
                .audience(java.util.List.of(PROJECT))
                .issuedAt(now)
                .expiresAt(now.plusSeconds(3600))
                .claim("auth_time", now.getEpochSecond())
                .claim("firebase", Map.of("sign_in_provider", provider));
        customize.accept(b);
        return b.build();
    }

    private static OAuth2TokenValidatorResult check(Jwt jwt) {
        return FirebaseAuthService.validate(jwt, PROJECT, MAX_AGE);
    }

    private static String error(OAuth2TokenValidatorResult r) {
        return r.getErrors().iterator().next().getDescription();
    }

    @Test
    void acceptsPhoneSignInWithPhoneNumber() {
        assertFalse(check(token("phone", b -> b.claim("phone_number", "+919000000001"))).hasErrors());
    }

    @Test
    void rejectsPhoneSignInWithoutPhoneNumber() {
        assertEquals("Missing phone number", error(check(token("phone", b -> { }))));
    }

    @Test
    void acceptsGoogleSignInWithVerifiedEmail() {
        assertFalse(check(token("google.com", b -> b.claim("email", "a@example.com").claim("email_verified", true)))
                .hasErrors());
    }

    @Test
    void rejectsGoogleSignInWithUnverifiedEmail() {
        assertEquals("Email is not verified",
                error(check(token("google.com", b -> b.claim("email", "a@example.com").claim("email_verified", false)))));
    }

    @Test
    void rejectsGoogleSignInWithoutEmailVerifiedClaim() {
        assertTrue(check(token("google.com", b -> b.claim("email", "a@example.com"))).hasErrors());
    }

    @Test
    void rejectsGoogleSignInWithoutEmail() {
        assertEquals("Missing email", error(check(token("google.com", b -> b.claim("email_verified", true)))));
    }

    @Test
    void rejectsOtherSignInMethods() {
        assertEquals("Unsupported sign-in method",
                error(check(token("password", b -> b.claim("email", "a@example.com").claim("email_verified", true)))));
        assertEquals("Unsupported sign-in method",
                error(check(token("anonymous", b -> { }))));
    }

    @Test
    void rejectsWrongAudience() {
        Jwt jwt = token("phone", b -> b.claim("phone_number", "+919000000001").audience(java.util.List.of("other")));
        assertEquals("Invalid audience", error(check(jwt)));
    }

    @Test
    void rejectsStaleSignIn() {
        long old = Instant.now().minusSeconds(MAX_AGE + 60).getEpochSecond();
        Jwt jwt = token("google.com", b -> b.claim("email", "a@example.com").claim("email_verified", true)
                .claim("auth_time", old));
        assertEquals("Sign-in is too old", error(check(jwt)));
    }
}
