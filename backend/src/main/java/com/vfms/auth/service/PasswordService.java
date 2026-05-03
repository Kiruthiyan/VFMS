package com.vfms.auth.service;

import com.vfms.auth.dto.ChangePasswordRequest;
import com.vfms.auth.dto.ForgotPasswordRequest;
import com.vfms.auth.dto.ResetPasswordRequest;
import com.vfms.auth.entity.PasswordResetToken;
import com.vfms.auth.repository.PasswordResetTokenRepository;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Password management service
 * Handles password reset, change, and complexity validation
 * Enforces strong password policy on backend (never trust frontend)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // Password complexity constants
    private static final String PASSWORD_PATTERN = 
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
    private static final String PASSWORD_COMPLEXITY_MSG = 
        "Password must contain: uppercase letter, lowercase letter, digit (0-9), and special character (@$!%*?&)";

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────

    /**
     * Initiates password reset flow
     * Always returns success to prevent email enumeration attacks
     * Only sends reset email for APPROVED accounts
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always respond with success message to prevent email enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            // Only send reset email for approved accounts
            if (user.getStatus() == UserStatus.APPROVED) {
                resetTokenRepository.deleteByUser(user);

                String token = UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                        .token(token)
                        .user(user)
                        .expiryDate(Instant.now().plus(1, ChronoUnit.HOURS))
                        .build();
                resetTokenRepository.save(resetToken);

                emailService.sendPasswordResetEmail(
                        user.getEmail(), user.getFullName(), token);
                
                log.info("Password reset email sent for user: {}", user.getEmail());
            }
        });
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────

    /**
     * Validates and resets password using reset token
     * Enforces password complexity rules
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // Validate password complexity
        if (!isStrongPassword(request.getNewPassword())) {
            throw new ValidationException(PASSWORD_COMPLEXITY_MSG);
        }

        // Find and validate reset token
        PasswordResetToken resetToken = resetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invalid or expired reset link. Please request a new one."));

        if (resetToken.isExpired()) {
            log.warn("Password reset attempt with expired token");
            throw new ValidationException(
                    "Reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete token after use
        resetTokenRepository.deleteByUser(user);
        
        log.info("Password reset successfully for user: {}", user.getEmail());
    }

    // ── CHANGE PASSWORD (logged-in user) ──────────────────────────────────

    /**
     * Allows authenticated user to change their password
     * Validates current password and password complexity
     */
    @Transactional
    public void changePassword(User currentUser, ChangePasswordRequest request) {
        // Validate new passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("New passwords do not match");
        }

        // Validate not same as current
        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new ValidationException(
                    "New password must be different from your current password");
        }

        // Validate current password is correct
        if (!passwordEncoder.matches(
                request.getCurrentPassword(), currentUser.getPassword())) {
            log.warn("Invalid current password for user: {}", currentUser.getEmail());
            throw new ValidationException("Current password is incorrect");
        }

        // Validate new password complexity
        if (!isStrongPassword(request.getNewPassword())) {
            throw new ValidationException(PASSWORD_COMPLEXITY_MSG);
        }

        currentUser.setPassword(
                passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        
        log.info("Password changed successfully for user: {}", currentUser.getEmail());
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    /**
     * Validates password complexity
     * Requirements:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one digit
     * - At least one special character (@$!%*?&)
     * 
     * @param password the password to validate
     * @return true if password meets all requirements, false otherwise
     */
    private boolean isStrongPassword(String password) {
        if (password == null || password.isEmpty()) {
            return false;
        }
        
        return password.matches(PASSWORD_PATTERN);
    }
}
