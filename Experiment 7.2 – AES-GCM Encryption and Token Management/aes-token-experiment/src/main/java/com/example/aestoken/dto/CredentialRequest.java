package com.example.aestoken.dto;

public record CredentialRequest(
        String provider,
        String accessToken,
        String refreshToken
) {}
