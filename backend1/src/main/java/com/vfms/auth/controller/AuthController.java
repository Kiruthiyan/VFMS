package com.vfms.auth.controller;

import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.RefreshTokenRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.dto.SendOtpRequest;
import com.vfms.auth.dto.StaffEmailCheckRequest;
import com.vfms.auth.dto.StaffVerificationRequest;
import com.vfms.auth.dto.VerifyOtpRequest;
import com.vfms.auth.dto.VerifyOtpResponse;
import com.vfms.auth.service.AuthService;
import com.vfms.auth.service.OtpService;
import com.vfms.common.dto.ApiResponse;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.ValidationException;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes the public authentication, signup, and verification endpoints used
 * by the VFMS frontend.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    /**
     * Sends an email verification code for OTP-based flows that still depend on
     * the legacy verification service.
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        try {
            otpService.sendOtp(request.getEmail().trim().toLowerCase());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Verification code sent to your email. Please check your inbox.",
                            null
                    )
            );
        } catch (ValidationException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send verification code. Please try again later."));
        }
    }

    /**
     * Verifies the submitted OTP and confirms that the user can continue with
     * any OTP-based verification flow.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequest request
    ) {
        try {
            otpService.verifyOtp(request.getEmail().trim().toLowerCase(), request.getOtp().trim());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "OTP verified successfully. You can now proceed with registration.",
                            new VerifyOtpResponse(true)
                    )
            );
        } catch (RuntimeException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Verification failed. Please try again."));
        }
    }

    /**
     * Authenticates a user and returns the current access and refresh tokens.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Login successful", authService.login(request))
        );
    }

    /**
     * Exchanges a valid refresh token for a new access token pair.
     */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("Token refreshed successfully", authService.refresh(request))
        );
    }

    /**
     * Invalidates the refresh token state for the authenticated user.
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@AuthenticationPrincipal User user) {
        authService.logout(user);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    /**
     * Checks whether the company email belongs to an active staff registry
     * record before the signup flow can continue.
     */
    @PostMapping("/staff/email-check")
    public ResponseEntity<ApiResponse<Void>> verifyStaffEmail(
            @Valid @RequestBody StaffEmailCheckRequest request
    ) {
        authService.verifyStaffEmailEligibility(request.getEmail());
        return ResponseEntity.ok(
                ApiResponse.success("Company email verified. You can continue with registration.", null)
        );
    }

    /**
     * Re-validates the collected staff details against the verified company
     * staff registry before password setup.
     */
    @PostMapping("/staff/verify")
    public ResponseEntity<ApiResponse<Void>> verifyStaffDetails(
            @Valid @RequestBody StaffVerificationRequest request
    ) {
        authService.verifyStaffRegistrationDetails(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Staff details verified successfully. You can continue to password setup.",
                        null
                )
        );
    }

    /**
     * Creates a self-service account for verified company staff only.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(
                        "Registration successful. Please check your email to verify your account.",
                        null
                )
        );
    }

    /**
     * Confirms the verification link and updates the account status according
     * to the verified role workflow.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        UserStatus status = authService.verifyEmail(token);
        String message = status == UserStatus.APPROVED
                ? "Email verified. Your company staff account is now approved and ready to sign in."
                : "Email verified. Your account is pending admin approval.";

        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    /**
     * Re-sends the email verification link for accounts that are still waiting
     * for email confirmation.
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request
    ) {
        authService.resendVerification(request);
        return ResponseEntity.ok(
                ApiResponse.success("Verification email sent. Please check your inbox.", null)
        );
    }
}
