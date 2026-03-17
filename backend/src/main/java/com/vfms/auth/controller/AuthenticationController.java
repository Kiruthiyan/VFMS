package com.vfms.auth.controller;

<<<<<<< HEAD
import com.vfms.auth.dto.*;
=======
import com.vfms.auth.annotation.RateLimited;
import com.vfms.auth.dto.AuthenticationRequest;
import com.vfms.auth.dto.AuthenticationResponse;
import com.vfms.auth.dto.ForgotPasswordRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.SendVerificationCodeRequest;
import com.vfms.auth.dto.VerifyEmailCodeRequest;
>>>>>>> 0c49f51 (fixed user verification)
import com.vfms.auth.service.AuthenticationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
     * Public endpoint - no authentication required
     * Rate limited to prevent email spam
     */
    @PostMapping("/send-verification-code")
<<<<<<< HEAD
    public ResponseEntity<String> sendVerificationCode(@Valid @RequestBody SendVerificationRequest request) {
=======
    @RateLimited(maxAttempts = 3, timeWindowMinutes = 15, message = "Too many verification code requests. Please try again in 15 minutes.")
    public ResponseEntity<String> sendVerificationCode(@Valid @RequestBody SendVerificationCodeRequest request) {
>>>>>>> 0c49f51 (fixed user verification)
        service.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok("Verification code sent");
    }

    /**
     * Step 2: Verify the OTP the user received.
     * Public endpoint - no authentication required
     * Rate limited to prevent brute force on OTP
     */
    @PostMapping("/verify-email-code")
<<<<<<< HEAD
=======
    @RateLimited(maxAttempts = 5, timeWindowMinutes = 15, message = "Too many verification attempts. Please try again in 15 minutes.")
>>>>>>> 0c49f51 (fixed user verification)
    public ResponseEntity<String> verifyEmailCode(@Valid @RequestBody VerifyEmailCodeRequest request) {
        service.verifyEmailOtp(request.getEmail(), request.getCode());
        return ResponseEntity.ok("Email verified");
    }

    /**
     * Step 3: Admin creates a new user. Temp password is emailed directly to user —
     * not returned here.
     * Admin-only endpoint
     */
    @PostMapping("/signup")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<AuthenticationResponse> signup(
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(service.signup(request));
    }

    /**
     * User login endpoint
     * Public endpoint - no authentication required
     * Rate limited to prevent brute force login attacks
     */
    @PostMapping("/authenticate")
    @RateLimited(maxAttempts = 5, timeWindowMinutes = 15, message = "Too many login attempts. Please try again in 15 minutes.")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @Valid @RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));
    }

    /**
     * Forgot password - sends reset link
     * Public endpoint - no authentication required
     * Rate limited to prevent password reset abuse
     */
    @PostMapping("/forgot-password")
<<<<<<< HEAD
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset code sent to your email");
=======
    @RateLimited(maxAttempts = 3, timeWindowMinutes = 15, message = "Too many password reset requests. Please try again in 15 minutes.")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        service.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Password reset link sent");
>>>>>>> 0c49f51 (fixed user verification)
    }

    /**
     * Verify OTP for password reset
     * Public endpoint - no authentication required
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@Valid @RequestBody com.vfms.auth.dto.VerifyOtpRequest request) {
        service.verifyOtp(request.getEmail(), request.getToken());
        return ResponseEntity.ok("OTP verified successfully");
    }

    /**
     * Reset password - requires valid OTP token
     * Public endpoint - but validated by OTP token
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody com.vfms.auth.dto.SetPasswordRequest request) {
        service.resetPassword(request.getEmail(), request.getToken(), request.getPassword());
        return ResponseEntity.ok("Password has been reset");
    }

    /**
     * Change password - requires authenticated user
     * Protected endpoint - requires valid JWT token
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
<<<<<<< HEAD
    public ResponseEntity<String> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
=======
    public ResponseEntity<String> changePassword(@Valid @RequestBody com.vfms.auth.dto.ChangePasswordRequest request) {
>>>>>>> 0c49f51 (fixed user verification)
        service.changePassword(request.getUserId(), request.getNewPassword());
        return ResponseEntity.ok("Password changed successfully");
    }
}
