package com.vfms.auth.service;

import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.entity.EmailVerificationToken;
import com.vfms.auth.repository.EmailVerificationTokenRepository;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.dto.LoginRequest;
import com.vfms.security.JwtService;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.exception.ResourceNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    // ── LOGIN ─────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthenticationException("Invalid email or password."));
        
        String jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(jwtToken)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    // ── REGISTER ──────────────────────────────────────────────────────────

    @Transactional
    public void register(RegisterRequest request) {

        // 1. Password match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        // 2. Only DRIVER and SYSTEM_USER can self-register
        if (request.getRequestedRole() != Role.DRIVER
                && request.getRequestedRole() != Role.SYSTEM_USER) {
            throw new ValidationException(
                    "Self-registration is only allowed for Driver and System User roles");
        }

        // 3. Role-specific field validation
        validateRoleSpecificFields(request);

        // 4. Check existing email
        userRepository.findByEmail(request.getEmail()).ifPresent(existing -> {
            if (existing.getStatus() == UserStatus.REJECTED) {
                // Re-registration allowed after rejection — reset and reuse record
                resetUserForReRegistration(existing, request);
                userRepository.save(existing);
                sendVerificationEmail(existing);
                return;
            }
            throw new ValidationException("An account with this email already exists");
        });

        // If the email was handled above as re-registration, stop here
        if (userRepository.existsByEmail(request.getEmail())) {
            return;
        }

        // 5. Create new user
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .nic(request.getNic())
                .role(request.getRequestedRole())
                .status(UserStatus.EMAIL_UNVERIFIED)
                .emailVerified(false)
                .build();

        applyRoleSpecificFields(user, request);
        userRepository.save(user);

        // 6. Send verification email
        sendVerificationEmail(user);
    }

    // ── VERIFY EMAIL ─────────────────────────────────────────────────────

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken =
                verificationTokenRepository.findByToken(token)
                        .orElseThrow(() -> new ResourceNotFoundException("Invalid verification link"));

        if (verificationToken.isExpired()) {
            throw new ValidationException(
                    "Verification link has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setStatus(UserStatus.PENDING_APPROVAL);
        userRepository.save(user);

        // Remove used token
        verificationTokenRepository.deleteByUser(user);
    }

    // ── RESEND VERIFICATION ───────────────────────────────────────────────

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with this email"));

        if (user.isEmailVerified()) {
            throw new ValidationException("Email is already verified");
        }

        if (user.getStatus() != UserStatus.EMAIL_UNVERIFIED) {
            throw new ValidationException("Email is already verified");
        }

        // Delete old token and send new one
        verificationTokenRepository.deleteByUser(user);
        sendVerificationEmail(user);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plus(24, ChronoUnit.HOURS))
                .build();
        verificationTokenRepository.save(verificationToken);
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), token);
    }

    private void validateRoleSpecificFields(RegisterRequest request) {
        if (request.getRequestedRole() == Role.DRIVER) {
            if (request.getLicenseNumber() == null
                    || request.getLicenseNumber().isBlank()) {
                throw new ValidationException(
                        "License number is required for Driver registration");
            }
            if (request.getLicenseExpiryDate() == null
                    || request.getLicenseExpiryDate().isBlank()) {
                throw new ValidationException(
                        "License expiry date is required for Driver registration");
            }
        }

        if (request.getRequestedRole() == Role.SYSTEM_USER) {
            if (request.getEmployeeId() == null
                    || request.getEmployeeId().isBlank()) {
                throw new ValidationException(
                        "Employee ID is required for System User registration");
            }
            if (request.getDepartment() == null
                    || request.getDepartment().isBlank()) {
                throw new ValidationException(
                        "Department is required for System User registration");
            }
        }
    }

    private void applyRoleSpecificFields(User user, RegisterRequest request) {
        if (request.getRequestedRole() == Role.DRIVER) {
            user.setLicenseNumber(request.getLicenseNumber());
            if (request.getLicenseExpiryDate() != null
                    && !request.getLicenseExpiryDate().isBlank()) {
                user.setLicenseExpiryDate(
                        LocalDate.parse(request.getLicenseExpiryDate()));
            }
            user.setCertifications(request.getCertifications());
            user.setExperienceYears(request.getExperienceYears());
        } else if (request.getRequestedRole() == Role.SYSTEM_USER) {
            user.setEmployeeId(request.getEmployeeId());
            user.setDepartment(request.getDepartment());
            user.setOfficeLocation(request.getOfficeLocation());
            user.setDesignation(request.getDesignation());
        }
    }

    private void resetUserForReRegistration(User user, RegisterRequest request) {
        user.setFullName(request.getFullName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setNic(request.getNic());
        user.setRole(request.getRequestedRole());
        user.setStatus(UserStatus.EMAIL_UNVERIFIED);
        user.setEmailVerified(false);
        user.setRejectionReason(null);
        user.setReviewedAt(null);
        applyRoleSpecificFields(user, request);
    }
}
