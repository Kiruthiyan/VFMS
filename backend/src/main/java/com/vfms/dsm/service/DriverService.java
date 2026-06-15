package com.vfms.dsm.service;

import com.vfms.dsm.dto.DriverUserResponse;
import com.vfms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import java.util.List;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverService {
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<DriverUserResponse> getDriverUsers(Pageable pageable) {
        Page<User> users = userRepository.findByRoleAndDeletedAtIsNull(com.vfms.common.enums.Role.DRIVER, pageable);
        return users.map(this::toDriverUserResponse);
    }

    @Transactional(readOnly = true)
    public DriverUserResponse getDriverUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getRole() == com.vfms.common.enums.Role.DRIVER && u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Driver user not found with id: " + userId));
        return toDriverUserResponse(user);
    }

    private DriverUserResponse toDriverUserResponse(User user) {
        return DriverUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .nic(user.getNic())
                .licenseNumber(user.getLicenseNumber())
                .licenseExpiryDate(user.getLicenseExpiryDate())
                .certifications(user.getCertifications())
                .experienceYears(user.getExperienceYears())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .employeeId(user.getEmployeeId())
                .driverId(user.getId()) // driverId is now same as userId
                .build();
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        if (id == null) {
            throw new IllegalArgumentException("User id cannot be null");
        }
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }
}
