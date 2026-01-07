package com.vfms.auth.controller;

import com.vfms.auth.dto.AuthenticationRequest;
import com.vfms.auth.dto.AuthenticationResponse;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    /**
     * Registers a new user with the provided details.
     *
     * @param request The registration request containing username, email, password,
     *                and role.
     * @return A ResponseEntity containing the authentication response (token).
     */
    /**
     * Admin creates a new user (Invite).
     */
    @PostMapping("/signup") // Changed from register
    public ResponseEntity<AuthenticationResponse> signup(
            @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.signup(request));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<String> verifyEmail(@org.springframework.web.bind.annotation.RequestParam String token) {
        service.verifyEmail(token);
        return ResponseEntity.ok("Email verified successfully");
    }

    @PostMapping("/set-password")
    public ResponseEntity<AuthenticationResponse> setPassword(
            @RequestBody com.vfms.auth.dto.SetPasswordRequest request) {
        return ResponseEntity.ok(service.setPassword(request.getToken(), request.getPassword()));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        service.forgotPassword(request.get("email"));
        return ResponseEntity.ok("Password reset link sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody com.vfms.auth.dto.SetPasswordRequest request) {
        service.resetPassword(request.getToken(), request.getPassword());
        return ResponseEntity.ok("Password has been reset");
    }
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@RequestBody com.vfms.auth.dto.ChangePasswordRequest request) {
        service.changePassword(request.getUserId(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }
}
