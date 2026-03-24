package com.vfms.auth.controller;

import com.vfms.auth.dto.ChangePasswordRequest;
import com.vfms.auth.dto.ForgotPasswordRequest;
import com.vfms.auth.dto.ResetPasswordRequest;
import com.vfms.auth.service.PasswordService;
import com.vfms.common.dto.ApiResponse;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    // ── PUBLIC ENDPOINTS (/api/auth/**) ──────────────────────────────────

    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        passwordService.forgotPassword(request);
        // Always return success — prevents email enumeration attack
        return ResponseEntity.ok(
                ApiResponse.success(
                        "If an account with that email exists, a reset link has been sent.",
                        null)
        );
    }

    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        passwordService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset successfully. You can now sign in.",
                        null)
        );
    }

    // ── AUTHENTICATED ENDPOINT (/api/user/**) ─────────────────────────────

    @PostMapping("/api/user/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        passwordService.changePassword(user, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully.",
                        null)
        );
    }
}
