package com.vfms.user.service;

import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.common.enums.Role;
import com.vfms.user.dto.StaffProfileResponse;
import com.vfms.user.dto.StaffProfileUpdateRequest;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffProfileService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public StaffProfileResponse getProfile(User user) {
        return mapToProfileResponse(user);
    }

    @Transactional
    public StaffProfileResponse updateProfile(User user, StaffProfileUpdateRequest request) {
        user.setPhone(request.getPhone() != null ? request.getPhone() : user.getPhone());
        user.setAddress(request.getAddress() != null ? request.getAddress() : user.getAddress());
        user.setEmergencyContactName(request.getEmergencyContactName() != null ? request.getEmergencyContactName() : user.getEmergencyContactName());
        user.setEmergencyContactPhone(request.getEmergencyContactPhone() != null ? request.getEmergencyContactPhone() : user.getEmergencyContactPhone());
        
        userRepository.save(user);
        return mapToProfileResponse(user);
    }

    @Transactional
    public void updateProfilePicture(User user, String photoUrl) {
        user.setPhotoUrl(photoUrl);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getStaffList() {
        // Find all users with SYSTEM_USER or APPROVER role who are not deleted
        return userRepository.findByRoleInAndDeletedAtIsNull(
                        java.util.Arrays.asList(Role.SYSTEM_USER, Role.APPROVER))
                .stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    private StaffProfileResponse mapToProfileResponse(User user) {
        return StaffProfileResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .firstName(getFirstName(user.getFullName()))
                .lastName(getLastName(user.getFullName()))
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nic(user.getNic())
                .role(user.getRole())
                .status(user.getStatus())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .officeLocation(user.getOfficeLocation())
                .photoUrl(user.getPhotoUrl())
                .address(user.getAddress())
                .emergencyContactName(user.getEmergencyContactName())
                .emergencyContactPhone(user.getEmergencyContactPhone())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserSummaryResponse mapToSummaryResponse(User user) {
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
                .employeeId(user.getEmployeeId())
                .department(user.getDepartment())
                .officeLocation(user.getOfficeLocation())
                .designation(user.getDesignation())
                .build();
    }

    private String getFirstName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "";
        String[] parts = fullName.trim().split("\\s+");
        return parts[0];
    }

    private String getLastName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "";
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 1 ? parts[parts.length - 1] : "";
    }
}
