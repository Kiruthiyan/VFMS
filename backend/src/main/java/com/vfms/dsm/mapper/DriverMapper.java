package com.vfms.dsm.mapper;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.Driver;
import org.springframework.stereotype.Component;

@Component
public class DriverMapper {
    public Driver toEntity(DriverRequest r) {
        return Driver.builder()
            .employeeId(r.getEmployeeId())
            .firstName(r.getFirstName())
            .lastName(r.getLastName())
            .nic(r.getNic())
            .dateOfBirth(r.getDateOfBirth())
            .phone(r.getPhone())
            .licenseNumber(r.getLicenseNumber())
            .licenseExpiryDate(r.getLicenseExpiryDate())
            .email(r.getEmail())
            .address(r.getAddress())
            .emergencyContactName(r.getEmergencyContactName())
            .emergencyContactPhone(r.getEmergencyContactPhone())
            .department(r.getDepartment())
            .designation(r.getDesignation())
            .dateOfJoining(r.getDateOfJoining())
            .build();
    }

    public DriverResponse toResponse(Driver d) {
        return DriverResponse.builder()
            .id(d.getId())
            .employeeId(d.getEmployeeId())
            .firstName(d.getFirstName())
            .lastName(d.getLastName())
            .nic(d.getNic())
            .dateOfBirth(d.getDateOfBirth())
            .phone(d.getPhone())
            .licenseNumber(d.getLicenseNumber())
            .licenseExpiryDate(d.getLicenseExpiryDate())
            .email(d.getEmail())
            .address(d.getAddress())
            .emergencyContactName(d.getEmergencyContactName())
            .emergencyContactPhone(d.getEmergencyContactPhone())
            .department(d.getDepartment())
            .designation(d.getDesignation())
            .dateOfJoining(d.getDateOfJoining())
            .photoUrl(d.getPhotoUrl())
            .status(d.getStatus())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
            .build();
    }

    public void updateEntity(Driver d, DriverRequest r) {
        d.setFirstName(r.getFirstName());
        d.setLastName(r.getLastName());
        d.setDateOfBirth(r.getDateOfBirth());
        d.setPhone(r.getPhone());
        d.setLicenseNumber(r.getLicenseNumber());
        d.setLicenseExpiryDate(r.getLicenseExpiryDate());
        d.setEmail(r.getEmail());
        d.setAddress(r.getAddress());
        d.setEmergencyContactName(r.getEmergencyContactName());
        d.setEmergencyContactPhone(r.getEmergencyContactPhone());
        d.setDepartment(r.getDepartment());
        d.setDesignation(r.getDesignation());
        d.setDateOfJoining(r.getDateOfJoining());
    }
}
