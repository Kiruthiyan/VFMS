package com.vfms.auth.service;

import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.dto.LoginRequest;
import com.vfms.auth.dto.RefreshTokenRequest;
import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.dto.StaffVerificationRequest;
import com.vfms.auth.entity.EmailVerificationToken;
import com.vfms.auth.entity.RefreshToken;
import com.vfms.auth.repository.EmailVerificationTokenRepository;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.AuthenticationException;
import com.vfms.common.exception.AuthorizationException;
import com.vfms.common.exception.ConflictException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.employee.entity.EmployeeRegistryRecord;
import com.vfms.employee.repository.EmployeeRegistryRepository;
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
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository verificationTokenRepository;
    private final EmployeeRegistryRepository employeeRegistryRepository;
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
            throw new AuthorizationException("This account is deactivated. Please contact your administrator.");
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

    /**
     * Confirms that the first-step company email belongs to an active staff
     * record before the registration form reveals additional steps.
     */
    @Transactional(readOnly = true)
    public void verifyStaffEmailEligibility(String email) {
        String normalizedEmail = normalizeEmail(email);
        EmployeeRegistryRecord staffRecord = findRegistryRecordByEmail(normalizedEmail);

        if (!staffRecord.isActive()) {
            throw new ValidationException(
                    "Staff record inactive",
                    Map.of(
                            "email",
                            "This company staff record is currently inactive. Please contact the system administrator for assistance."
                    )
            );
        }
    }

    /**
     * Re-validates the personal details entered during signup before the user
     * can proceed to password setup.
     */
    @Transactional(readOnly = true)
    public void verifyStaffRegistrationDetails(StaffVerificationRequest request) {
        validateStaffRegistration(
                request.getFullName(),
                request.getEmail(),
                request.getPhone(),
                request.getNic(),
                request.getEmployeeId()
        );
    }

    /**
     * Creates a self-service account only for verified company staff candidates.
     * Matching the signup payload against the employee registry prevents unverified
     * external users from creating staff accounts with arbitrary details.
     */
    @Transactional
    public void register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        String phone = normalizePhone(request.getPhone());
        String nic = normalizeNic(request.getNic());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException(
                    "Validation failed",
                    Map.of("confirmPassword", "Passwords do not match.")
            );
        }

        if (request.getRequestedRole() != Role.SYSTEM_USER) {
            throw new ValidationException(
                    "Validation failed",
                    Map.of(
                            "requestedRole",
                            "Public registration is available only for company staff. Driver, approver, and administrator accounts must be created by an administrator."
                    )
            );
        }

        EmployeeRegistryRecord verifiedStaffRecord =
                validateStaffRegistration(
                        request.getFullName(),
                        email,
                        phone,
                        nic,
                        request.getEmployeeId()
                );

        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (existing.getStatus() == UserStatus.REJECTED) {
                resetUserForReRegistration(existing, request, verifiedStaffRecord, email, phone, nic);
                userRepository.save(existing);
                sendVerificationEmail(existing);
                return;
            }

            throw new ConflictException(
                    "An account already exists with this email address.",
                    Map.of("email", "An account already exists with this email address. Please sign in or contact your administrator if you need help.")
            );
        }

        User user = User.builder()
                .fullName(verifiedStaffRecord.getFullName())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .nic(nic)
                .role(Role.SYSTEM_USER)
                .status(UserStatus.EMAIL_UNVERIFIED)
                .emailVerified(false)
                .build();

        applyVerifiedStaffFields(user, verifiedStaffRecord);
        userRepository.save(user);
        sendVerificationEmail(user);
    }

    @Transactional
    public UserStatus verifyEmail(String token) {
        EmailVerificationToken verificationToken =
                verificationTokenRepository.findByToken(token)
                        .orElseThrow(() -> new ResourceNotFoundException("Invalid verification link"));

        if (verificationToken.isExpired()) {
            throw new ValidationException(
                    "Verification link has expired. Please request a new one.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        UserStatus nextStatus = user.getRole() == Role.SYSTEM_USER
                ? UserStatus.APPROVED
                : UserStatus.PENDING_APPROVAL;
        user.setStatus(nextStatus);
        userRepository.save(user);
        verificationTokenRepository.deleteByUser(user);
        return nextStatus;
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

    /**
     * Validates self-registration details against the verified staff registry.
     * The registry remains the trusted source of truth for employee identity,
     * while the users table only stores application accounts.
     */
    private EmployeeRegistryRecord validateStaffRegistration(
            String fullName,
            String email,
            String phone,
            String nic,
            String employeeIdValue
    ) {
        Map<String, String> errors = new LinkedHashMap<>();
        String normalizedEmail = normalizeEmail(email);
        String normalizedPhone = normalizePhone(phone);
        String normalizedNic = normalizeNic(nic);
        String employeeId = normalizeIdentifier(employeeIdValue);
        if (employeeId == null) {
            errors.put("employeeId", "Enter your employee ID exactly as it appears in the company staff registry.");
        }

        EmployeeRegistryRecord staffRecord = null;
        if (employeeId != null) {
            List<EmployeeRegistryRecord> staffRecords =
                    employeeRegistryRepository.findAllByEmployeeIdIgnoreCase(employeeId);

            if (staffRecords.isEmpty()) {
                errors.put("employeeId", "We could not find a verified company staff record for this employee ID. Check the ID and try again, or contact your administrator.");
            } else if (staffRecords.size() > 1) {
                errors.put("employeeId", "Multiple company staff records were found for this employee ID. Please contact the system administrator for assistance.");
            } else {
                staffRecord = staffRecords.get(0);
            }

            if (staffRecord != null && !staffRecord.isActive()) {
                errors.put("employeeId", "This staff record is currently inactive. Please contact your administrator for assistance.");
            } else if (staffRecord != null) {
                if (!staffRecord.getEmail().equalsIgnoreCase(normalizedEmail)) {
                    errors.put("email", "The email address does not match the verified company staff record for this employee ID.");
                }
                if (!normalizeFullName(staffRecord.getFullName()).equals(normalizeFullName(fullName))) {
                    errors.put("fullName", "The full name does not match the verified company staff record for this employee ID.");
                }
                if (!normalizeNic(staffRecord.getNic()).equals(normalizedNic)) {
                    errors.put("nic", "The NIC number does not match the verified company staff record for this employee ID.");
                }
                if (!normalizePhone(staffRecord.getPhone()).equals(normalizedPhone)) {
                    errors.put("phone", "The phone number does not match the verified company staff record for this employee ID.");
                }
            }
        }

        if (!errors.isEmpty()) {
            String employeeIdError = errors.get("employeeId");
            String message;
            if (errors.size() == 1 && employeeIdError != null) {
                message = employeeIdError.contains("inactive")
                        ? "Staff record inactive"
                        : "Staff record not found";
            } else {
                message = "Staff verification failed";
            }
            throw new ValidationException(message, errors);
        }

        return staffRecord;
    }

    private EmployeeRegistryRecord findRegistryRecordByEmail(String email) {
        List<EmployeeRegistryRecord> staffRecords = employeeRegistryRepository.findAllByEmailIgnoreCase(email);

        if (staffRecords.isEmpty()) {
            throw new ValidationException(
                    "Staff record not found",
                    Map.of(
                            "email",
                            "This email address is not registered in the company staff registry. Please use your official company email address or contact the system administrator."
                    )
            );
        }

        if (staffRecords.size() > 1) {
            throw new ValidationException(
                    "Staff verification failed",
                    Map.of(
                            "email",
                            "Multiple company staff records were found for this email address. Please contact the system administrator for assistance."
                    )
            );
        }

        return staffRecords.get(0);
    }

    /**
     * Copies staff profile fields from the verified registry record so approved
     * staff accounts inherit department and office details from company records.
     */
    private void applyVerifiedStaffFields(User user, EmployeeRegistryRecord staffRecord) {
        clearRoleSpecificFields(user);
        user.setEmployeeId(staffRecord.getEmployeeId());
        user.setDepartment(staffRecord.getDepartment());
        user.setOfficeLocation(staffRecord.getOfficeLocation());
        user.setDesignation(staffRecord.getDesignation());
    }

    private void clearRoleSpecificFields(User user) {
        user.setLicenseNumber(null);
        user.setLicenseExpiryDate(null);
        user.setCertifications(null);
        user.setExperienceYears(null);
        user.setEmployeeId(null);
        user.setDepartment(null);
        user.setOfficeLocation(null);
        user.setDesignation(null);
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeEmail(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.toLowerCase();
    }

    private String normalizeIdentifier(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.toUpperCase();
    }

    private String normalizeFullName(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.replaceAll("\\s+", " ").toLowerCase();
    }

    private String normalizeNic(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.replaceAll("\\s+", "").toUpperCase();
    }

    private String normalizePhone(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.replaceAll("\\s+", "");
    }

    private void resetUserForReRegistration(
            User user,
            RegisterRequest request,
            EmployeeRegistryRecord staffRecord,
            String email,
            String phone,
            String nic
    ) {
        user.setFullName(staffRecord.getFullName());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(phone);
        user.setNic(nic);
        user.setRole(Role.SYSTEM_USER);
        user.setStatus(UserStatus.EMAIL_UNVERIFIED);
        user.setEmailVerified(false);
        user.setRejectionReason(null);
        user.setReviewedAt(null);
        applyVerifiedStaffFields(user, staffRecord);
    }

    /**
     * Applies the business status rules that sit on top of raw password validation.
     * A correct password is not enough if the account is still unverified, pending
     * review, rejected, or deactivated.
     */
    private void validateLoginStatus(User user) {
        if (!user.isEmailVerified() || user.getStatus() == UserStatus.EMAIL_UNVERIFIED) {
            throw new ValidationException("Please verify your email before signing in.");
        }
        if (user.getStatus() == UserStatus.PENDING_APPROVAL) {
            throw new AuthorizationException("Your account is pending admin approval.");
        }
        if (user.getStatus() == UserStatus.REJECTED) {
            throw new AuthorizationException("Your registration was rejected. Please contact an administrator.");
        }
        if (user.getStatus() == UserStatus.DEACTIVATED) {
            throw new AuthorizationException("This account is deactivated. Please contact your administrator.");
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
