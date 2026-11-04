package com.example.aestoken.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long expiresIn
) {}
