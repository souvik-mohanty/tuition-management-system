package com.tuition.saas.auth.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/** Redis-backed auth state: server-side sessions, single-use Firebase ID tokens and login rate counters. */
@Component
public class RedisAuthStore {

    private static final String PREFIX = "tuitionsaas:auth:";

    private final StringRedisTemplate redis;

    public RedisAuthStore(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public void createSession(String jti, Long userId, Duration ttl) {
        redis.opsForValue().set(PREFIX + "session:" + jti, String.valueOf(userId), ttl);
    }

    public boolean isSessionActive(String jti) {
        return Boolean.TRUE.equals(redis.hasKey(PREFIX + "session:" + jti));
    }

    public void revokeSession(String jti) {
        redis.delete(PREFIX + "session:" + jti);
    }

    /** Returns true only the first time a token hash is seen (SET NX), blocking replay of a captured ID token. */
    public boolean markIdTokenUsed(String tokenHash, Duration ttl) {
        return Boolean.TRUE.equals(redis.opsForValue().setIfAbsent(PREFIX + "idtoken:" + tokenHash, "1", ttl));
    }

    /** Fixed-window counter; returns the count after incrementing. */
    public long incrementAttempts(String key, Duration window) {
        String redisKey = PREFIX + "rl:" + key;
        Long count = redis.opsForValue().increment(redisKey);
        if (count != null && count == 1L) {
            redis.expire(redisKey, window);
        }
        return count == null ? 0L : count;
    }
}
