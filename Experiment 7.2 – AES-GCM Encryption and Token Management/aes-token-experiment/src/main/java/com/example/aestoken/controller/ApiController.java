package com.example.aestoken.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {

    @GetMapping("/public")
    public Map<String, String> publicApi() {
        return Map.of(
                "message", "Public API is available",
                "security", "No access token required"
        );
    }

    @GetMapping("/protected")
    public Map<String, String> protectedApi(Authentication authentication) {
        return Map.of(
                "message", "Protected API access allowed",
                "username", authentication.getName()
        );
    }
}
