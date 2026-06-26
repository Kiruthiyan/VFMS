package com.vfms.dsm.mapper;

import com.vfms.dsm.dto.DriverResponses.DriverResponse;
import com.vfms.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class DriverMapper {

    public DriverResponse toResponse(User d) {
        return toResponseFromUser(d);
    }

    public DriverResponse toResponseFromUser(User user) {
        String firstName = user.getFullName() != null ? user.getFullName().trim() : "Driver";
        String lastName = "";
        int lastSpaceIdx = firstName.lastIndexOf(' ');
        if (lastSpaceIdx > 0) {
            lastName = firstName.substring(lastSpaceIdx + 1);
            firstName = firstName.substring(0, lastSpaceIdx);
        }

        return DriverResponse.builder()
            .id(user.getId())
            .employeeId(user.getEmployeeId())
            .firstName(firstName)
            .lastName(lastName)
            .nic(user.getNic())
            .phone(user.getPhone())
            .licenseNumber(user.getLicenseNumber())
            .licenseExpiryDate(user.getLicenseExpiryDate())
            .email(user.getEmail())
            .address(user.getAddress())
            .emergencyContactName(user.getEmergencyContactName())
            .emergencyContactPhone(user.getEmergencyContactPhone())
            .department(user.getDepartment())
            .designation(user.getDesignation())
            .photoUrl(user.getPhotoUrl())
            .createdAt(user.getCreatedAt())
            .updatedAt(user.getUpdatedAt())
            .ratingPercentage(null) // populated later by Trip Scheduling / Staff Dashboard integration
            .build();
    }
}
