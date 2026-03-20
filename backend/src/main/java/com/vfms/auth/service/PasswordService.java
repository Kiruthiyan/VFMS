package com.vfms.auth.service;

import com.vfms.auth.dto.ChangePasswordRequest;
import com.vfms.auth.dto.ForgotPasswordRequest;
import com.vfms.auth.dto.ResetPasswordRequest;
import com.vfms.auth.entity.PasswordResetToken;
import com.vfms.auth.repository.PasswordResetTokenRepository;
import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────

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
            }
        });
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        PasswordResetToken resetToken = resetTokenRepository
                .findByToken(request.getToken())
                .orElseThrow(() -> new RuntimeException(
                        "Invalid or expired reset link. Please request a new one."));

        if (resetToken.isExpired()) {
            throw new RuntimeException(
                    "Reset link has expired. Please request a new one.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete token after use
        resetTokenRepository.deleteByUser(user);
    }

    // ── CHANGE PASSWORD (logged-in user) ──────────────────────────────────

    @Transactional
    public void changePassword(User currentUser,
                               ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new RuntimeException(
                    "New password must be different from your current password");
        }

        if (!passwordEncoder.matches(
                request.getCurrentPassword(), currentUser.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        currentUser.setPassword(
                passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }
}
