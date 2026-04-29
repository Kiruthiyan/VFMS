package com.vfms.admin.service;

import com.vfms.admin.config.UserManagementProperties;
import com.vfms.admin.dto.CreateUserRequest;
import com.vfms.admin.dto.ReviewDecision;
import com.vfms.admin.dto.ReviewUserRequest;
import com.vfms.admin.dto.SoftDeleteRequest;
import com.vfms.admin.dto.UpdateUserRequest;
import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.auth.service.EmailService;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.security.SecurityContextProvider;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final UserManagementProperties userManagementProperties;

    @Transactional
    public UserSummaryResponse createUser(CreateUserRequest request) {
        String email = normalizeEmail(request.getEmail());
        String phone = normalizeOptional(request.getPhone());

        if (phone == null) {
            throw new ValidationException("Validation failed", Map.of(
                    "phone", "Phone number is required."
            ));
        }

        if (userRepository.existsByEmailAndDeletedAtIsNull(email)) {
            throw new ValidationException(
                    "An active account with this email already exists.");
        }

        validateRoleSpecificFields(request.getRole(), request.getLicenseNumber(),
                request.getLicenseExpiryDate(), request.getEmployeeId(),
                request.getDepartment(), request.getOfficeLocation(),
                request.getDesignation(), request.getApprovalLevel());

        String tempPassword = generateTempPassword();

        User user = User.builder()
                .fullName(normalizeRequired(request.getFullName()))
                .email(email)
                .password(passwordEncoder.encode(tempPassword))
                .phone(phone)
                .nic(normalizeRequired(request.getNic()).toUpperCase())
                .role(request.getRole())
                .status(UserStatus.APPROVED)
                .emailVerified(true)
                .createdByAdmin(true)
                .passwordChangeRequired(true)
                .createdBy(SecurityContextProvider.getCurrentUserEmail())
                .build();

        applyRoleSpecificCreateFields(user, request);
        userRepository.save(user);

        log.info("[ADMIN-CREATE] User created: {} ({}) as {}",
                user.getFullName(), user.getEmail(), user.getRole());

        try {
            emailService.sendWelcomeEmail(
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name().replace("_", " "),
                    tempPassword);
        } catch (Exception ex) {
            log.error("[ADMIN-CREATE] Failed to send welcome email to {}: {}",
                    user.getEmail(), ex.getMessage());
        }

        return toSummary(user);
    }

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public List<UserSummaryResponse> getPendingUsers() {
        return userRepository
                .findByStatusAndDeletedAtIsNullOrderByCreatedAtAsc(UserStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public UserSummaryResponse getUserById(UUID userId) {
        return toSummary(findUser(userId));
    }

    public List<UserSummaryResponse> getDeletedUsers() {
        return userRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    public Map<String, Long> getUserCounts() {
        Map<String, Long> counts = new LinkedHashMap<>();
        counts.put("total", userRepository.countByDeletedAtIsNull());
        counts.put("approved",
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.APPROVED));
        counts.put("pending",
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.PENDING_APPROVAL));
        counts.put("rejected",
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.REJECTED));
        counts.put("deactivated",
                userRepository.countByStatusAndDeletedAtIsNull(UserStatus.DEACTIVATED));
        counts.put("deleted", userRepository.countByDeletedAtIsNotNull());
        return counts;
    }

    @Transactional
    public void reviewUser(UUID userId, ReviewUserRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("Cannot review a deleted user.");
        }

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new ValidationException(
                    "User is not in PENDING_APPROVAL status. Current status: " + user.getStatus());
        }

        if (request.getDecision() == ReviewDecision.APPROVE) {
            if (request.getAssignedRole() != null && request.getAssignedRole() != user.getRole()) {
                user.setRole(request.getAssignedRole());
                clearRoleSpecificFields(user);
            }

            user.setStatus(UserStatus.APPROVED);
            user.setReviewedAt(LocalDateTime.now());
            user.setRejectionReason(null);
            userRepository.save(user);

            emailService.sendApprovalEmail(
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name());
            return;
        }

        if (request.getDecision() == ReviewDecision.REJECT) {
            String rejectionReason = normalizeOptional(request.getRejectionReason());
            if (rejectionReason == null) {
                throw new ValidationException("Rejection reason is required");
            }

            user.setStatus(UserStatus.REJECTED);
            user.setRejectionReason(rejectionReason);
            user.setReviewedAt(LocalDateTime.now());
            userRepository.save(user);

            emailService.sendRejectionEmail(
                    user.getEmail(),
                    user.getFullName(),
                    rejectionReason);
            return;
        }

        throw new ValidationException("Decision must be APPROVE or REJECT");
    }

    @Transactional
    public void softDeleteUser(UUID userId, SoftDeleteRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("User is already deleted.");
        }

        user.setStatusBeforeDeletion(user.getStatus());
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedReason(request.getReason());
        user.setDeletedBy(SecurityContextProvider.getCurrentUserEmail());
        user.setStatus(UserStatus.DEACTIVATED);
        userRepository.save(user);

        log.info("[ADMIN-DELETE] User soft-deleted: {} ({}). Reason: {}",
                user.getFullName(), user.getEmail(), request.getReason());
    }

    @Transactional
    public void restoreUser(UUID userId) {
        User user = findUser(userId);

        if (user.getDeletedAt() == null) {
            throw new ValidationException("User is not deleted and cannot be restored.");
        }

        UserStatus restoredStatus = user.getStatusBeforeDeletion() != null
                ? user.getStatusBeforeDeletion()
                : UserStatus.APPROVED;

        user.setStatus(restoredStatus);
        user.setDeletedAt(null);
        user.setDeletedReason(null);
        user.setDeletedBy(null);
        user.setStatusBeforeDeletion(null);
        user.setRestoredBy(SecurityContextProvider.getCurrentUserEmail());
        userRepository.save(user);

        log.info("[ADMIN-RESTORE] User restored: {} ({}) to status: {}",
                user.getFullName(), user.getEmail(), restoredStatus);
    }

    @Transactional
    public void toggleUserStatus(UUID userId) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("Cannot toggle status of a deleted user.");
        }

        if (user.getStatus() == UserStatus.APPROVED) {
            user.setStatus(UserStatus.DEACTIVATED);
        } else if (user.getStatus() == UserStatus.DEACTIVATED) {
            user.setStatus(UserStatus.APPROVED);
        } else {
            throw new ValidationException(
                    "Only APPROVED or DEACTIVATED accounts can be toggled. Current status: "
                            + user.getStatus());
        }

        userRepository.save(user);
    }

    @Transactional
    public UserSummaryResponse updateUser(UUID userId, UpdateUserRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("Cannot edit a deleted user.");
        }

        Role targetRole = request.getRole() != null ? request.getRole() : user.getRole();
        boolean roleChanged = targetRole != user.getRole();

        if (request.getFullName() != null) {
            user.setFullName(normalizeRequired(request.getFullName()));
        }

        if (request.getEmail() != null) {
            String normalizedEmail = normalizeEmail(request.getEmail());
            if (!normalizedEmail.equals(user.getEmail())
                    && userRepository.existsByEmailAndDeletedAtIsNull(normalizedEmail)) {
                throw new ValidationException("An active account with this email already exists.");
            }
            user.setEmail(normalizedEmail);
        }

        if (request.getPhone() != null) {
            String phone = normalizeOptional(request.getPhone());
            if (phone != null) {
                user.setPhone(phone);
            }
        }

        if (request.getNic() != null) {
            String nic = normalizeOptional(request.getNic());
            if (nic != null) {
                user.setNic(nic.toUpperCase());
            }
        }

        if (roleChanged) {
            user.setRole(targetRole);
            clearRoleSpecificFields(user);
        }

        applyRoleSpecificUpdateFields(user, request, targetRole);
        validateRoleSpecificFields(targetRole, user.getLicenseNumber(),
                user.getLicenseExpiryDate() != null ? user.getLicenseExpiryDate().toString() : null,
                user.getEmployeeId(), user.getDepartment(),
                user.getOfficeLocation(), user.getDesignation(),
                user.getApprovalLevel());

        userRepository.save(user);
        return toSummary(user);
    }

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        int length = Math.max(8, userManagementProperties.getTempPassword().getLength());
        String chars = userManagementProperties.getTempPassword().getChars();
        if (chars == null || chars.isBlank()) {
            throw new ValidationException("Temporary password character set is not configured.");
        }

        StringBuilder tempPassword = new StringBuilder(length);
        for (int index = 0; index < length; index++) {
            tempPassword.append(chars.charAt(random.nextInt(chars.length())));
        }
        return tempPassword.toString();
    }

    private void applyRoleSpecificCreateFields(User user, CreateUserRequest request) {
        clearRoleSpecificFields(user);

        if (request.getRole() == Role.DRIVER) {
            user.setLicenseNumber(normalizeIdentifier(request.getLicenseNumber()));
            user.setLicenseExpiryDate(parseOptionalDate(request.getLicenseExpiryDate()));
            user.setCertifications(normalizeOptional(request.getCertifications()));
            user.setExperienceYears(request.getExperienceYears());
            return;
        }

        user.setEmployeeId(normalizeIdentifier(request.getEmployeeId()));
        user.setDepartment(normalizeOptional(request.getDepartment()));
        user.setOfficeLocation(normalizeOptional(request.getOfficeLocation()));
        user.setDesignation(normalizeOptional(request.getDesignation()));
        if (request.getRole() == Role.APPROVER) {
            user.setApprovalLevel(normalizeOptional(request.getApprovalLevel()));
        }
    }

    private void applyRoleSpecificUpdateFields(User user, UpdateUserRequest request, Role targetRole) {
        if (targetRole == Role.DRIVER) {
            if (request.getLicenseNumber() != null) {
                user.setLicenseNumber(normalizeIdentifier(request.getLicenseNumber()));
            }
            if (request.getLicenseExpiryDate() != null) {
                user.setLicenseExpiryDate(parseOptionalDate(request.getLicenseExpiryDate()));
            }
            if (request.getCertifications() != null) {
                user.setCertifications(normalizeOptional(request.getCertifications()));
            }
            if (request.getExperienceYears() != null) {
                user.setExperienceYears(request.getExperienceYears());
            }
            return;
        }

        if (request.getEmployeeId() != null) {
            user.setEmployeeId(normalizeIdentifier(request.getEmployeeId()));
        }
        if (request.getDepartment() != null) {
            user.setDepartment(normalizeOptional(request.getDepartment()));
        }
        if (request.getOfficeLocation() != null) {
            user.setOfficeLocation(normalizeOptional(request.getOfficeLocation()));
        }
        if (request.getDesignation() != null) {
            user.setDesignation(normalizeOptional(request.getDesignation()));
        }
        if (targetRole == Role.APPROVER && request.getApprovalLevel() != null) {
            user.setApprovalLevel(normalizeOptional(request.getApprovalLevel()));
        }
        if (targetRole != Role.APPROVER) {
            user.setApprovalLevel(null);
        }
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
        user.setApprovalLevel(null);
    }

    private void validateRoleSpecificFields(
            Role role,
            String licenseNumber,
            String licenseExpiryDate,
            String employeeId,
            String department,
            String officeLocation,
            String designation,
            String approvalLevel
    ) {
        Map<String, String> errors = new LinkedHashMap<>();

        if (role == Role.DRIVER) {
            if (normalizeOptional(licenseNumber) == null) {
                errors.put("licenseNumber", "License number is required for driver accounts.");
            }

            String expiryDate = normalizeOptional(licenseExpiryDate);
            if (expiryDate == null) {
                errors.put("licenseExpiryDate", "License expiry date is required for driver accounts.");
            } else {
                try {
                    LocalDate parsedDate = LocalDate.parse(expiryDate);
                    if (parsedDate.isBefore(LocalDate.now())) {
                        errors.put("licenseExpiryDate",
                                "License expiry date must be today or later.");
                    }
                } catch (Exception ex) {
                    errors.put("licenseExpiryDate",
                            "License expiry date must be a valid date.");
                }
            }
        }

        if (role == Role.SYSTEM_USER) {
            if (normalizeOptional(employeeId) == null) {
                errors.put("employeeId", "Employee ID is required for staff accounts.");
            }
            if (normalizeOptional(department) == null) {
                errors.put("department", "Department is required for staff accounts.");
            }
            if (normalizeOptional(officeLocation) == null) {
                errors.put("officeLocation", "Office location is required for staff accounts.");
            }
            if (normalizeOptional(designation) == null) {
                errors.put("designation", "Designation is required for staff accounts.");
            }
        }

        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed", errors);
        }
    }

    private LocalDate parseOptionalDate(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : LocalDate.parse(normalizedValue);
    }

    private String normalizeEmail(String email) {
        return normalizeRequired(email).toLowerCase();
    }

    private String normalizeIdentifier(String value) {
        String normalizedValue = normalizeOptional(value);
        return normalizedValue == null ? null : normalizedValue.toUpperCase();
    }

    private String normalizeRequired(String value) {
        String normalizedValue = normalizeOptional(value);
        if (normalizedValue == null) {
            throw new ValidationException("Validation failed");
        }
        return normalizedValue;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private UserSummaryResponse toSummary(User user) {
        return UserSummaryResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nic(user.getNic())
                .role(user.getRole())
                .status(user.getStatus())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .reviewedAt(user.getReviewedAt())
                .rejectionReason(user.getRejectionReason())
                .createdByAdmin(user.isCreatedByAdmin())
                .passwordChangeRequired(user.isPasswordChangeRequired())
                .deletedAt(user.getDeletedAt())
                .deletedReason(user.getDeletedReason())
                .createdBy(user.getCreatedBy())
                .deletedBy(user.getDeletedBy())
                .restoredBy(user.getRestoredBy())
                .licenseNumber(user.getLicenseNumber())
                .licenseExpiryDate(user.getLicenseExpiryDate())
                .certifications(user.getCertifications())
                .experienceYears(user.getExperienceYears())
                .employeeId(user.getEmployeeId())
                .department(user.getDepartment())
                .officeLocation(user.getOfficeLocation())
                .designation(user.getDesignation())
                .approvalLevel(user.getApprovalLevel())
                .build();
    }
}
