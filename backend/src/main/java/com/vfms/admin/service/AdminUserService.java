package com.vfms.admin.service;

import com.vfms.admin.dto.ReviewUserRequest;
import com.vfms.admin.dto.UpdateUserRequest;
import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.auth.service.EmailService;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    // ── GET ALL USERS ─────────────────────────────────────────────────────

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── GET PENDING USERS ─────────────────────────────────────────────────

    public List<UserSummaryResponse> getPendingUsers() {
        return userRepository
                .findByStatusOrderByCreatedAtAsc(UserStatus.PENDING_APPROVAL)
                .stream()
                .map(this::toSummary)
                .collect(Collectors.toList());
    }

    // ── GET SINGLE USER ───────────────────────────────────────────────────

    public UserSummaryResponse getUserById(UUID userId) {
        User user = findUser(userId);
        return toSummary(user);
    }

    // ── REVIEW (APPROVE / REJECT) ─────────────────────────────────────────

    @Transactional
    public void reviewUser(UUID userId, ReviewUserRequest request) {
        User user = findUser(userId);

        if (user.getStatus() != UserStatus.PENDING_APPROVAL) {
            throw new RuntimeException(
                    "User is not in PENDING_APPROVAL status. "
                    + "Current status: " + user.getStatus());
        }

        if ("APPROVE".equalsIgnoreCase(request.getDecision())) {

            // Handle optional role change — only SYSTEM_USER → APPROVER allowed
            if (request.getAssignedRole() != null
                    && request.getAssignedRole() != user.getRole()) {
                validateRoleChange(user.getRole(), request.getAssignedRole());
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
                throw new RuntimeException("Rejection reason is required");
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
            throw new RuntimeException("Decision must be APPROVE or REJECT");
        }
    }

    // ── DEACTIVATE / REACTIVATE ───────────────────────────────────────────

    @Transactional
    public void toggleUserStatus(UUID userId) {
        User user = findUser(userId);

        if (user.getStatus() == UserStatus.APPROVED) {
            user.setStatus(UserStatus.DEACTIVATED);
        } else if (user.getStatus() == UserStatus.DEACTIVATED) {
            user.setStatus(UserStatus.APPROVED);
        } else {
            throw new RuntimeException(
                    "Only APPROVED or DEACTIVATED accounts can be toggled. "
                    + "Current status: " + user.getStatus());
        }

        userRepository.save(user);
    }

    // ── UPDATE USER DETAILS ───────────────────────────────────────────────

    @Transactional
    public UserSummaryResponse updateUser(UUID userId,
                                          UpdateUserRequest request) {
        User user = findUser(userId);

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        if (request.getDepartment() != null
                && !request.getDepartment().isBlank()) {
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

        // Role change with restriction
        if (request.getRole() != null && request.getRole() != user.getRole()) {
            validateRoleChange(user.getRole(), request.getRole());
            user.setRole(request.getRole());
        }

        userRepository.save(user);
        return toSummary(user);
    }

    // ── HELPERS ───────────────────────────────────────────────────────────

    private User findUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found: " + userId));
    }

    private void validateRoleChange(Role currentRole, Role newRole) {
        boolean allowed = currentRole == Role.SYSTEM_USER
                && newRole == Role.APPROVER;
        if (!allowed) {
            throw new RuntimeException(
                    "Role change not permitted. "
                    + "Admin can only promote System User to Approver.");
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
                .reviewedAt(user.getReviewedAt())
                .rejectionReason(user.getRejectionReason())
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
