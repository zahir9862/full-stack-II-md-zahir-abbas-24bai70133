package com.example.aestoken.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "oauth_credentials")
public class OAuthCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String provider;

    @Column(length = 2000, nullable = false)
    private String encryptedAccessToken;

    @Column(length = 2000, nullable = false)
    private String encryptedRefreshToken;

    private Instant accessTokenExpiry;

    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getEncryptedAccessToken() { return encryptedAccessToken; }
    public void setEncryptedAccessToken(String value) { this.encryptedAccessToken = value; }
    public String getEncryptedRefreshToken() { return encryptedRefreshToken; }
    public void setEncryptedRefreshToken(String value) { this.encryptedRefreshToken = value; }
    public Instant getAccessTokenExpiry() { return accessTokenExpiry; }
    public void setAccessTokenExpiry(Instant value) { this.accessTokenExpiry = value; }
}
