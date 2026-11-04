package com.example.aestoken.service;

import com.example.aestoken.crypto.AesUtil;
import com.example.aestoken.entity.OAuthCredential;
import com.example.aestoken.repository.OAuthCredentialRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class CredentialService {

    private final OAuthCredentialRepository repository;
    private final AesUtil aesUtil;

    public CredentialService(OAuthCredentialRepository repository, AesUtil aesUtil) {
        this.repository = repository;
        this.aesUtil = aesUtil;
    }

    public OAuthCredential save(String provider, String accessToken, String refreshToken) throws Exception {
        OAuthCredential credential = repository.findFirstByProvider(provider)
                .orElseGet(OAuthCredential::new);

        credential.setProvider(provider);
        credential.setEncryptedAccessToken(aesUtil.encrypt(accessToken));
        credential.setEncryptedRefreshToken(aesUtil.encrypt(refreshToken));
        credential.setAccessTokenExpiry(Instant.now().plusSeconds(900));

        return repository.save(credential);
    }

    public String decryptAccessToken(Long id) throws Exception {
        OAuthCredential credential = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credential not found"));
        return aesUtil.decrypt(credential.getEncryptedAccessToken());
    }
}
