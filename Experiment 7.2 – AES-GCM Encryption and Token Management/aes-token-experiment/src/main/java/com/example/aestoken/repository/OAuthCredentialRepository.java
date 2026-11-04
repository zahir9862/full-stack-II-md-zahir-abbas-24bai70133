package com.example.aestoken.repository;

import com.example.aestoken.entity.OAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OAuthCredentialRepository extends JpaRepository<OAuthCredential, Long> {
    Optional<OAuthCredential> findFirstByProvider(String provider);
}
