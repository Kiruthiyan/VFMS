package com.vfms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> creds) {
        // Dummy login implementation for test
        Map<String, String> response = new HashMap<>();
        if ("kiruthiyan7@gmail.com".equals(creds.get("email")) && "123456".equals(creds.get("password"))) {
            response.put("token", "fake-jwt-token-for-testing");
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(401).body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<Map<String, String>> getUser(@RequestHeader("Authorization") String token) {
        Map<String, String> response = new HashMap<>();
        response.put("email", "kiruthiyan7@gmail.com");
        response.put("role", "ADMIN");
        return ResponseEntity.ok(response);
    }
}
