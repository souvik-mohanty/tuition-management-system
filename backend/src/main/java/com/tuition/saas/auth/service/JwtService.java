package com.tuition.saas.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

/** Issues our own access JWTs and registers each one as a Redis session so it can be revoked. */
@Service
public class JwtService {

    public static final String ISSUER = "tuition-saas";

    private final JwtEncoder encoder;
    private final RedisAuthStore store;
    private final Duration ttl;

    public JwtService(JwtEncoder encoder, RedisAuthStore store, @Value("${app.jwt.ttl-minutes}") long ttlMinutes) {
        this.encoder = encoder;
        this.store = store;
        this.ttl = Duration.ofMinutes(ttlMinutes);
    }

    public String issueAccessToken(Long userId) {
        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .subject(String.valueOf(userId))
                .id(jti)
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .build();
        String token = encoder.encode(
                JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        store.createSession(jti, userId, ttl);
        return token;
    }
}
