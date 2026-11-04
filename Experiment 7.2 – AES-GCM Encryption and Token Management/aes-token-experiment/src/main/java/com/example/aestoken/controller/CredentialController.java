package com.example.aestoken.controller;

import com.example.aestoken.dto.CredentialRequest;
import com.example.aestoken.entity.OAuthCredential;
import com.example.aestoken.service.CredentialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/credentials")
public class CredentialController {

    private final CredentialService credentialService;

    public CredentialController(CredentialService credentialService) {
        this.credentialService = credentialService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> save(@RequestBody CredentialRequest request)
            throws Exception {
        OAuthCredential saved = credentialService.save(
                request.provider(),
                request.accessToken(),
                request.refreshToken());

        return ResponseEntity.ok(Map.of(
                "message", "Credential encrypted and stored",
                "id", saved.getId(),
                "provider", saved.getProvider(),
                "accessTokenStoredAs", "AES-GCM ciphertext",
                "refreshTokenStoredAs", "AES-GCM ciphertext"
        ));
    }

    @GetMapping("/{id}/access-token")
    public ResponseEntity<Map<String, String>> decrypt(@PathVariable Long id) throws Exception {
        return ResponseEntity.ok(Map.of(
                "decryptedAccessToken",
                credentialService.decryptAccessToken(id)
        ));
    }
}
