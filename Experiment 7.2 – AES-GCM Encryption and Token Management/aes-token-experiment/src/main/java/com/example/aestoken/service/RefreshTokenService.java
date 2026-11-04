package com.example.aestoken.service;

import com.example.aestoken.entity.RefreshToken;
import com.example.aestoken.repository.RefreshTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long refreshTokenDays;

    public RefreshTokenService(
            RefreshTokenRepository repository,
            @Value("${app.jwt.refresh-token-days:7}") long refreshTokenDays) {
        this.repository = repository;
        this.refreshTokenDays = refreshTokenDays;
    }

    public IssuedRefreshToken issue(String username) {
        String rawToken = generateSecureRandomToken();
        String family = UUID.randomUUID().toString();

        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(hash(rawToken));
        entity.setUsername(username);
        entity.setExpiresAt(Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
        entity.setRevoked(false);
        entity.setTokenFamily(family);

        repository.save(entity);
        return new IssuedRefreshToken(rawToken, entity.getExpiresAt(), family);
    }

    public RefreshToken findValid(String rawToken) {
        RefreshToken stored = repository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (stored.isRevoked()) {
            revokeFamily(stored.getTokenFamily());
            throw new IllegalArgumentException("Refresh token revoked or reused");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.setRevoked(true);
            repository.save(stored);
            throw new IllegalArgumentException("Refresh token expired");
        }

        return stored;
    }

    public IssuedRefreshToken rotate(RefreshToken oldToken) {
        oldToken.setRevoked(true);
        repository.save(oldToken);

        return issueWithFamily(oldToken.getUsername(), oldToken.getTokenFamily());
    }

    public void revoke(String rawToken) {
        repository.findByTokenHash(hash(rawToken)).ifPresent(token -> {
            token.setRevoked(true);
            repository.save(token);
        });
    }

    private IssuedRefreshToken issueWithFamily(String username, String family) {
        String rawToken = generateSecureRandomToken();

        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(hash(rawToken));
        entity.setUsername(username);
        entity.setExpiresAt(Instant.now().plus(refreshTokenDays, ChronoUnit.DAYS));
        entity.setRevoked(false);
        entity.setTokenFamily(family);

        repository.save(entity);
        return new IssuedRefreshToken(rawToken, entity.getExpiresAt(), family);
    }

    private void revokeFamily(String family) {
        repository.findByTokenFamily(family).forEach(token -> token.setRevoked(true));
        repository.findByTokenFamily(family).forEach(repository::save);
    }

    public String generateSecureRandomToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    public String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to hash token", e);
        }
    }

    public record IssuedRefreshToken(String token, Instant expiresAt, String family) {}
}
