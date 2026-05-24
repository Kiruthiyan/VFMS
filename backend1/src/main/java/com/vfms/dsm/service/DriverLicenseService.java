package com.vfms.dsm.service;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.*;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverLicenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class DriverLicenseService {
    private final DriverLicenseRepository licenseRepository;
    private final DriverService driverService;
    private final DriverReadinessService readinessService;

    public DriverLicenseResponse addLicense(DriverLicenseRequest request) {
        Driver driver = driverService.findById(request.getDriverId());
        DriverLicense license = DriverLicense.builder()
            .driver(driver)
            .licenseNumber(request.getLicenseNumber())
            .category(request.getCategory())
            .issuingAuthority(request.getIssuingAuthority())
            .issueDate(request.getIssueDate())
            .expiryDate(request.getExpiryDate())
            .isPrimary(Boolean.TRUE.equals(request.getIsPrimary()))
            .build();
        DriverLicense saved = licenseRepository.save(license);
        readinessService.refreshForDriver(driver.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DriverLicenseResponse> getLicensesByDriver(UUID driverId) {
        return licenseRepository.findByDriver_IdOrderByCreatedAtDesc(driverId).stream().map(this::toResponse).collect(Collectors.toList());
    }

    public DriverLicenseResponse updateLicense(Long id, DriverLicenseRequest request) {
        DriverLicense license = licenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
        license.setLicenseNumber(request.getLicenseNumber());
        license.setCategory(request.getCategory());
        license.setIssuingAuthority(request.getIssuingAuthority());
        license.setIssueDate(request.getIssueDate());
        license.setExpiryDate(request.getExpiryDate());
        if (request.getIsPrimary() != null) license.setIsPrimary(request.getIsPrimary());
        DriverLicense saved = licenseRepository.save(license);
        readinessService.refreshForDriver(saved.getDriver().getId());
        return toResponse(saved);
    }

    public void deleteLicense(Long id) {
        DriverLicense license = licenseRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
        UUID driverId = license.getDriver().getId();
        licenseRepository.delete(license);
        readinessService.refreshForDriver(driverId);
    }

    private DriverLicenseResponse toResponse(DriverLicense l) {
        return DriverLicenseResponse.builder()
            .id(l.getId()).driverId(l.getDriver().getId())
            .driverName(l.getDriver().getFirstName() + " " + l.getDriver().getLastName())
            .licenseNumber(l.getLicenseNumber()).category(l.getCategory())
            .issuingAuthority(l.getIssuingAuthority()).issueDate(l.getIssueDate())
            .expiryDate(l.getExpiryDate()).documentUrl(l.getDocumentUrl())
            .isPrimary(l.getIsPrimary()).status(l.getStatus())
            .build();
    }
}
