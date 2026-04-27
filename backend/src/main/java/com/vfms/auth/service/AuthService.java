package com.vfms.auth.service;

import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.RefreshTokenRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.entity.EmailVerificationToken;
import com.vfms.auth.entity.RefreshToken;
import com.vfms.auth.repository.EmailVerificationTokenRepository;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.security.JwtService;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthenticationException("Invalid email or password."));

        validateLoginStatus(user);

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (DisabledException ex) {
            throw new ValidationException("Your account is deactivated. Contact your administrator.");
        } catch (BadCredentialsException ex) {
            throw new AuthenticationException("Invalid email or password.");
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new AuthenticationException("Unable to sign in with the provided credentials.");
        }

        String accessToken = jwtService.generateToken(user);
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        return buildAuthResponse(user, accessToken, refreshToken.getToken());
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Invalid refresh token."));

        if (refreshToken.isExpired()) {
            refreshTokenService.deleteByUser(refreshToken.getUser());
            throw new AuthenticationException("Refresh token has expired. Please sign in again.");
        }

        User user = refreshToken.getUser();
        validateLoginStatus(user);

        String accessToken = jwtService.generateToken(user);
        RefreshToken rotatedRefreshToken = refreshTokenService.createRefreshToken(user);
        return buildAuthResponse(user, accessToken, rotatedRefreshToken.getToken());
    }

    @Transactional
    public void logout(User user) {
        if (user != null) {
            refreshTokenService.deleteByUser(user);
        }
    }

    public AuthResponse getCurrentUser(User user) {
        if (user == null) {
            throw new AuthenticationException("User is not authenticated.");
        }
        return buildAuthResponse(user, null, null);
    }

    @Transactional
    public void register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("Passwords do not match");
        }

        if (request.getRequestedRole() != Role.DRIVER
                && request.getRequestedRole() != Role.SYSTEM_USER) {
            throw new ValidationException(
                    "Self-registration is only allowed for Driver and System User roles");
        }

        validateRoleSpecificFields(request);

        userRepository.findByEmail(email).ifPresent(existing -> {
            if (existing.getStatus() == UserStatus.REJECTED) {
                resetUserForReRegistration(existing, request, email);
                userRepository.save(existing);
                sendVerificationEmail(existing);
                return;
            }
            throw new ValidationException("An account with this email already exists");
        });

        if (userRepository.existsByEmail(email)) {
            return;
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone().trim())
                .nic(request.getNic().trim())
                .role(request.getRequestedRole())
                .status(UserStatus.EMAIL_UNVERIFIED)
                .emailVerified(false)
                .build();

        applyRoleSpecificFields(user, request);
        userRepository.save(user);
        sendVerificationEmail(user);
    }

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
        verificationTokenRepository.deleteByUser(user);
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No account found with this email"));

        if (user.isEmailVerified() || user.getStatus() != UserStatus.EMAIL_UNVERIFIED) {
            throw new ValidationException("Email is already verified");
        }

        verificationTokenRepository.deleteByUser(user);
        sendVerificationEmail(user);
    }

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
            if (request.getLicenseNumber() == null || request.getLicenseNumber().isBlank()) {
                throw new ValidationException(
                        "License number is required for Driver registration");
            }
            if (request.getLicenseExpiryDate() == null || request.getLicenseExpiryDate().isBlank()) {
                throw new ValidationException(
                        "License expiry date is required for Driver registration");
            }
        }

        if (request.getRequestedRole() == Role.SYSTEM_USER) {
            if (request.getEmployeeId() == null || request.getEmployeeId().isBlank()) {
                throw new ValidationException(
                        "Employee ID is required for System User registration");
            }
            if (request.getDepartment() == null || request.getDepartment().isBlank()) {
                throw new ValidationException(
                        "Department is required for System User registration");
            }
        }
    }

    private void applyRoleSpecificFields(User user, RegisterRequest request) {
        if (request.getRequestedRole() == Role.DRIVER) {
            user.setLicenseNumber(request.getLicenseNumber());
            if (request.getLicenseExpiryDate() != null && !request.getLicenseExpiryDate().isBlank()) {
                user.setLicenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()));
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

    private void resetUserForReRegistration(User user, RegisterRequest request, String email) {
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone().trim());
        user.setNic(request.getNic().trim());
        user.setRole(request.getRequestedRole());
        user.setStatus(UserStatus.EMAIL_UNVERIFIED);
        user.setEmailVerified(false);
        user.setRejectionReason(null);
        user.setReviewedAt(null);
        applyRoleSpecificFields(user, request);
    }

    private void validateLoginStatus(User user) {
        if (!user.isEmailVerified() || user.getStatus() == UserStatus.EMAIL_UNVERIFIED) {
            throw new ValidationException("Please verify your email before signing in.");
        }
        if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new ValidationException("Your account is pending admin approval.");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new ValidationException("Your registration was rejected. Please contact an administrator.");
        }
        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new ValidationException("Your account is deactivated. Contact your administrator.");
        }
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }
}
