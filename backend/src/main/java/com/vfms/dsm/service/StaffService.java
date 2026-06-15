package com.vfms.dsm.service;

import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.common.enums.Role;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Provides staff-related data sourced exclusively from the `users` table.
 * Staff are users with role SYSTEM_USER or APPROVER.
 * The legacy `staff` table is no longer used.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StaffService {

    private final UserRepository userRepository;

    private static final List<Role> STAFF_ROLES = Arrays.asList(Role.SYSTEM_USER, Role.APPROVER);

    public Page<UserSummaryResponse> getAllStaff(@NonNull Pageable pageable) {
        List<User> users = userRepository.findByRoleInAndDeletedAtIsNull(STAFF_ROLES);
        List<UserSummaryResponse> all = users.stream()
                .sorted((a, b) -> {
                    if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                })
                .map(this::toResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        List<UserSummaryResponse> page = start >= all.size() ? List.of() : all.subList(start, end);
        return new PageImpl<>(page, pageable, all.size());
    }

    public UserSummaryResponse getStaff(@NonNull UUID id) {
        return toResponse(findById(id));
    }

    public User findById(@NonNull UUID id) {
        return userRepository.findById(id)
                .filter(u -> STAFF_ROLES.contains(u.getRole()) && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found: " + id));
    }

    private UserSummaryResponse toResponse(User u) {
        return UserSummaryResponse.builder()
                .id(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .nic(u.getNic())
                .role(u.getRole())
                .status(u.getStatus())
                .emailVerified(u.isEmailVerified())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .employeeId(u.getEmployeeId())
                .department(u.getDepartment())
                .officeLocation(u.getOfficeLocation())
                .designation(u.getDesignation())
                .build();
    }
}
