package com.example.aestoken.service;

import com.example.aestoken.dto.TokenResponse;
import com.example.aestoken.entity.RefreshToken;
import com.example.aestoken.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public TokenResponse login(String username, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        String role = username.equals("admin") ? "ADMIN" : "USER";
        String accessToken = jwtService.generateAccessToken(username, role);
        var refresh = refreshTokenService.issue(username);

        return new TokenResponse(
                accessToken,
                refresh.token(),
                jwtService.getAccessTokenSeconds());
    }

    public TokenResponse refresh(String rawRefreshToken) {
        RefreshToken stored = refreshTokenService.findValid(rawRefreshToken);
        var rotated = refreshTokenService.rotate(stored);

        String role = stored.getUsername().equals("admin") ? "ADMIN" : "USER";
        String accessToken = jwtService.generateAccessToken(stored.getUsername(), role);

        return new TokenResponse(
                accessToken,
                rotated.token(),
                jwtService.getAccessTokenSeconds());
    }

    public void revoke(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }
}
