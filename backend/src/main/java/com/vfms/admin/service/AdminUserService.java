package com.vfms.admin.service;

import com.vfms.admin.dto.*;
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
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final String TEMP_PASSWORD_CHARS =
            "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    private static final int TEMP_PASSWORD_LENGTH = 10;

    // ── CREATE USER (Admin) ──────────────────────────────────────────────

    @Transactional
    public UserSummaryResponse createUser(CreateUserRequest request) {
        // Check duplicate email among active users
        if (userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
            throw new ValidationException(
                    "An active account with this email already exists.");
        }

        // Generate temporary password
        String tempPassword = generateTempPassword();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(tempPassword))
                .phone(request.getPhone())
                .nic(request.getNic())
                .role(request.getRole())
                .status(UserStatus.APPROVED)
                .emailVerified(true)
                .createdByAdmin(true)
                .passwordChangeRequired(true)
                .createdBy(SecurityContextProvider.getCurrentUserEmail())
                .build();

        // Apply role-specific fields
        applyRoleSpecificFields(user, request);

        userRepository.save(user);

        log.info("[ADMIN-CREATE] User created: {} ({}) as {}",
                user.getFullName(), user.getEmail(), user.getRole());

        // Send welcome email with temp password
        try {
            emailService.sendWelcomeEmail(
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name().replace("_", " "),
                    tempPassword);
        } catch (Exception e) {
            log.error("[ADMIN-CREATE] Failed to send welcome email to {}: {}",
                    user.getEmail(), e.getMessage());
        }

        return toSummary(user);
    }

    // ── GET ALL ACTIVE USERS ─────────────────────────────────────────────

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── GET PENDING USERS ────────────────────────────────────────────────

    public List<UserSummaryResponse> getPendingUsers() {
        return userRepository
                .findByStatusAndDeletedAtIsNullOrderByCreatedAtAsc(
                        UserStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE USER ──────────────────────────────────────────────────

    public UserSummaryResponse getUserById(UUID userId) {
        User user = findUser(userId);
        return toSummary(user);
    }

    // ── GET DELETED USERS (History) ──────────────────────────────────────

    public List<UserSummaryResponse> getDeletedUsers() {
        return userRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc()
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── GET USER COUNTS (for dashboard summary cards) ────────────────────

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
        counts.put("deleted",
                (long) userRepository.findByDeletedAtIsNotNullOrderByDeletedAtDesc().size());
        return counts;
    }

    // ── REVIEW (APPROVE / REJECT) ────────────────────────────────────────

    @Transactional
    public void reviewUser(UUID userId, ReviewUserRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("Cannot review a deleted user.");
        }

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new ValidationException(
                    "User is not in PENDING_APPROVAL status. "
                    + "Current status: " + user.getStatus());
        }

        if ("APPROVE".equalsIgnoreCase(request.getDecision())) {

            if (request.getAssignedRole() != null
                    && request.getAssignedRole() != user.getRole()) {
                user.setRole(request.getAssignedRole());
            }

            user.setStatus(UserStatus.APPROVED);
            user.setReviewedAt(LocalDateTime.now());
            user.setRejectionReason(null);
            userRepository.save(user);

            emailService.sendApprovalEmail(
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name());

        } else if ("REJECT".equalsIgnoreCase(request.getDecision())) {

            if (request.getRejectionReason() == null
                    || request.getRejectionReason().isBlank()) {
                throw new ValidationException("Rejection reason is required");
            }

            user.setStatus(UserStatus.REJECTED);
            user.setRejectionReason(request.getRejectionReason());
            user.setReviewedAt(LocalDateTime.now());
            userRepository.save(user);

            emailService.sendRejectionEmail(
                    user.getEmail(),
                    user.getFullName(),
                    request.getRejectionReason());

        } else {
            throw new ValidationException("Decision must be APPROVE or REJECT");
        }
    }

    // ── SOFT DELETE ──────────────────────────────────────────────────────

    @Transactional
    public void softDeleteUser(UUID userId, SoftDeleteRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("User is already deleted.");
        }

        // Preserve current status for potential restore
        user.setStatusBeforeDeletion(user.getStatus());
        user.setDeletedAt(LocalDateTime.now());
        user.setDeletedReason(request.getReason());
        user.setDeletedBy(SecurityContextProvider.getCurrentUserEmail());
        user.setStatus(UserStatus.DEACTIVATED);
        userRepository.save(user);

        log.info("[ADMIN-DELETE] User soft-deleted: {} ({}). Reason: {}",
                user.getFullName(), user.getEmail(), request.getReason());
    }

    // ── RESTORE USER ─────────────────────────────────────────────────────

    @Transactional
    public void restoreUser(UUID userId) {
        User user = findUser(userId);

        if (user.getDeletedAt() == null) {
            throw new ValidationException("User is not deleted and cannot be restored.");
        }

        // Restore to previous status
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

    // ── DEACTIVATE / REACTIVATE ──────────────────────────────────────────

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
                    "Only APPROVED or DEACTIVATED accounts can be toggled. "
                    + "Current status: " + user.getStatus());
        }

        userRepository.save(user);
    }

    // ── UPDATE USER DETAILS ──────────────────────────────────────────────

    @Transactional
    public UserSummaryResponse updateUser(UUID userId,
                                          UpdateUserRequest request) {
        User user = findUser(userId);

        if (user.getDeletedAt() != null) {
            throw new ValidationException("Cannot edit a deleted user.");
        }

        // Common fields
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check duplicate among active users (exclude current user)
            if (!request.getEmail().equals(user.getEmail())
                    && userRepository.existsByEmailAndDeletedAtIsNull(request.getEmail())) {
                throw new ValidationException("An active account with this email already exists.");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getNic() != null && !request.getNic().isBlank()) {
            user.setNic(request.getNic());
        }

        // Role change — admin can change any role
        if (request.getRole() != null && request.getRole() != user.getRole()) {
            user.setRole(request.getRole());
        }

        // Driver fields
        if (request.getLicenseNumber() != null) {
            user.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getLicenseExpiryDate() != null
                && !request.getLicenseExpiryDate().isBlank()) {
            user.setLicenseExpiryDate(
                    LocalDate.parse(request.getLicenseExpiryDate()));
        }
        if (request.getCertifications() != null) {
            user.setCertifications(request.getCertifications());
        }
        if (request.getExperienceYears() != null) {
            user.setExperienceYears(request.getExperienceYears());
        }

        // Staff fields
        if (request.getEmployeeId() != null) {
            user.setEmployeeId(request.getEmployeeId());
        }
        if (request.getDepartment() != null && !request.getDepartment().isBlank()) {
            user.setDepartment(request.getDepartment());
        }
        if (request.getOfficeLocation() != null
                && !request.getOfficeLocation().isBlank()) {
            user.setOfficeLocation(request.getOfficeLocation());
        }
        if (request.getDesignation() != null
                && !request.getDesignation().isBlank()) {
            user.setDesignation(request.getDesignation());
        }
        if (request.getApprovalLevel() != null
                && !request.getApprovalLevel().isBlank()) {
            user.setApprovalLevel(request.getApprovalLevel());
        }

        userRepository.save(user);
        return toSummary(user);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                new ResourceNotFoundException("User not found: " + userId));
    }

    private String generateTempPassword() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder(TEMP_PASSWORD_LENGTH);
        for (int i = 0; i < TEMP_PASSWORD_LENGTH; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(
                    random.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    private void applyRoleSpecificFields(User user, CreateUserRequest request) {
        if (request.getRole() == Role.DRIVER) {
            user.setLicenseNumber(request.getLicenseNumber());
            if (request.getLicenseExpiryDate() != null
                    && !request.getLicenseExpiryDate().isBlank()) {
                user.setLicenseExpiryDate(
                        LocalDate.parse(request.getLicenseExpiryDate()));
            }
            user.setCertifications(request.getCertifications());
            user.setExperienceYears(request.getExperienceYears());
        } else {
            user.setEmployeeId(request.getEmployeeId());
            user.setDepartment(request.getDepartment());
            user.setOfficeLocation(request.getOfficeLocation());
            user.setDesignation(request.getDesignation());
            if (request.getRole() == Role.APPROVER) {
                user.setApprovalLevel(request.getApprovalLevel());
            }
        }
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
