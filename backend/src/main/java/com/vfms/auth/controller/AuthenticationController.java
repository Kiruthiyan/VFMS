package com.vfms.auth.controller;

import com.vfms.auth.dto.AuthenticationRequest;
import com.vfms.auth.dto.AuthenticationResponse;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    /**
     * Step 1: Send OTP to the proposed email to verify it is valid and reachable.
     */
    @PostMapping("/send-verification-code")
    public ResponseEntity<String> sendVerificationCode(@RequestBody java.util.Map<String, String> request) {
        service.sendVerificationCode(request.get("email"));
        return ResponseEntity.ok("Verification code sent");
    }

    /**
     * Step 2: Verify the OTP the user received.
     */
    @PostMapping("/verify-email-code")
    public ResponseEntity<String> verifyEmailCode(@RequestBody java.util.Map<String, String> request) {
        service.verifyEmailOtp(request.get("email"), request.get("code"));
        return ResponseEntity.ok("Email verified");
    }

    /**
     * Step 3: Admin creates a new user. Temp password is emailed directly to user —
     * not returned here.
     */
    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> signup(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.signup(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        service.forgotPassword(request.get("email"));
        return ResponseEntity.ok("Password reset link sent");
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody com.vfms.auth.dto.VerifyOtpRequest request) {
        service.verifyOtp(request.getEmail(), request.getToken());
        return ResponseEntity.ok("OTP verified successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody com.vfms.auth.dto.SetPasswordRequest request) {
        service.resetPassword(request.getEmail(), request.getToken(), request.getPassword());
        return ResponseEntity.ok("Password has been reset");
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(@Valid @RequestBody com.vfms.auth.dto.ChangePasswordRequest request) {
        service.changePassword(request.getUserId(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }
}
