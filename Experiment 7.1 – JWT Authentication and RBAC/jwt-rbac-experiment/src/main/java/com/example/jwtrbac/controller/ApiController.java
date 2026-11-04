package com.example.jwtrbac.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    @GetMapping("/api/user")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public String userApi() {
        return "User API - Access Allowed";
    }

    @GetMapping("/api/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminApi() {
        return "Admin API - Access Allowed";
    }

    @GetMapping("/api/public")
    public String publicApi() {
        return "Public API";
    }
}
