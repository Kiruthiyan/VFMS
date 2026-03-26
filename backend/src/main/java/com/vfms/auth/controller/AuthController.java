package com.vfms.auth.controller;

import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.service.AuthService;
import com.vfms.auth.service.OtpService;
import com.vfms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    // ── OTP ENDPOINTS ─────────────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @RequestBody SendOtpRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Email is required")
                );
            }
            
            otpService.sendOtp(request.getEmail().trim().toLowerCase());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Verification code sent to your email. Please check your inbox.",
                            null)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to send verification code. Please check your email address and try again.")
            );
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @RequestBody VerifyOtpRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Email is required")
                );
            }
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Please enter the verification code sent to your email.")
                );
            }
            
            otpService.verifyOtp(request.getEmail().trim().toLowerCase(), request.getOtp().trim());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "OTP verified successfully. You can now proceed with registration.",
                            new VerifyOtpResponse(true))
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Verification failed. Please try again.")
            );
        }
    }

    // ── AUTHENTICATION ENDPOINTS ──────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<com.vfms.auth.dto.AuthResponse>> login(@Valid @RequestBody com.vfms.auth.dto.LoginRequest request) {
        com.vfms.auth.dto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ── REGISTRATION ENDPOINTS ────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(
                        "Registration successful. Please check your email to verify your account.",
                        null)
        );
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Email verified. Your account is pending admin approval.",
                        null)
        );
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Verification email sent. Please check your inbox.",
                        null)
        );
    }

    // ── REQUEST/RESPONSE DTOs ─────────────────────────────────────────────

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SendOtpRequest {
        private String email;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VerifyOtpResponse {
        private boolean verified;
    }
}
