package com.example.aestoken.controller;

import com.example.aestoken.dto.LoginRequest;
import com.example.aestoken.dto.RefreshRequest;
import com.example.aestoken.dto.TokenResponse;
import com.example.aestoken.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request.username(), request.password()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(@RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refresh(request.refreshToken()));
    }

    @PostMapping("/revoke")
    public ResponseEntity<Map<String, String>> revoke(@RequestBody RefreshRequest request) {
        authService.revoke(request.refreshToken());
        return ResponseEntity.ok(Map.of("message", "Refresh token revoked"));
    }
}
