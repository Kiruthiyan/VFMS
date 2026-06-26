package com.vfms.dsm.service;

import com.vfms.common.exception.AuthorizationException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.dto.DriverRequests.CertificationRequest;
import com.vfms.dsm.dto.DriverRequests.DriverLicenseRequest;
import com.vfms.dsm.dto.DriverRequests.DriverSelfCertificationRequest;
import com.vfms.dsm.dto.DriverResponses.DriverLicenseResponse;
import com.vfms.dsm.dto.DriverResponses.QualificationCheckResponse;
import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverCredentialService {
    private final DriverRepository repository;
    private final DriverService driverService;
    private final DriverReadinessService readinessService;

    private static final Map<String, List<DriverAggregate.DriverLicense.LicenseCategory>> VEHICLE_REQUIREMENTS = Map.of(
            "LIGHT", List.of(DriverAggregate.DriverLicense.LicenseCategory.B),
            "MEDIUM", List.of(DriverAggregate.DriverLicense.LicenseCategory.C),
            "HEAVY", List.of(DriverAggregate.DriverLicense.LicenseCategory.CE),
            "PASSENGER", List.of(DriverAggregate.DriverLicense.LicenseCategory.D),
            "TANKER", List.of(DriverAggregate.DriverLicense.LicenseCategory.CE));

    private static final Map<String, List<DriverAggregate.DriverCertification.CertificationType>> CERT_REQUIREMENTS = Map.of(
            "TANKER", List.of(DriverAggregate.DriverCertification.CertificationType.HAZMAT),
            "PASSENGER", List.of(DriverAggregate.DriverCertification.CertificationType.PASSENGER_TRANSPORT),
            "HEAVY", List.of(DriverAggregate.DriverCertification.CertificationType.HEAVY_VEHICLE));

    public DriverLicenseResponse addLicense(DriverLicenseRequest request) {
        User user = driverService.findById(request.getDriverId());
        DriverLicense saved = repository.saveLicense(buildLicense(user, request));
        readinessService.refreshForDriver(user.getId());
        return toAdminLicenseResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DriverLicenseResponse> getLicensesByDriver(UUID driverId) {
        return repository.findLicensesByDriver(driverId).stream().map(this::toAdminLicenseResponse).toList();
    }

    public DriverLicenseResponse updateLicense(Long id, DriverLicenseRequest request) {
        DriverLicense license = repository.findLicenseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
        applyLicenseRequest(license, request);
        DriverLicense saved = repository.saveLicense(license);
        readinessService.refreshForDriver(saved.getUser().getId());
        return toAdminLicenseResponse(saved);
    }

    public void deleteLicense(Long id) {
        DriverLicense license = repository.findLicenseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
        UUID driverId = license.getUser().getId();
        repository.deleteLicense(license);
        readinessService.refreshForDriver(driverId);
    }

    public DriverCertification addCertification(CertificationRequest request) {
        User user = driverService.findById(request.getDriverId());
        return repository.saveCertification(DriverCertification.builder().user(user)
                .certType(request.getCertType()).certName(request.getCertName()).issuedBy(request.getIssuedBy())
                .issueDate(request.getIssueDate()).expiryDate(request.getExpiryDate()).build());
    }

    @Transactional(readOnly = true)
    public List<DriverCertification> getCertificationsByDriver(UUID driverId) {
        return repository.findCertificationsByDriver(driverId);
    }

    public DriverCertification updateCertification(Long id, CertificationRequest request) {
        DriverCertification cert = repository.findCertificationById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found: " + id));
        cert.setCertType(request.getCertType()); cert.setCertName(request.getCertName());
        cert.setIssuedBy(request.getIssuedBy()); cert.setIssueDate(request.getIssueDate());
        cert.setExpiryDate(request.getExpiryDate());
        return repository.saveCertification(cert);
    }

    public void deleteCertification(Long id) { repository.deleteCertification(id); }

    @Transactional(readOnly = true)
    public QualificationCheckResponse checkQualification(UUID driverId, String vehicleCategory) {
        String normalized = vehicleCategory == null ? "" : vehicleCategory.toUpperCase();
        List<String> reasons = new ArrayList<>();
        List<DriverLicense.LicenseCategory> requiredClasses = VEHICLE_REQUIREMENTS.getOrDefault(normalized, List.of());
        boolean validLicense = repository.findLicensesByDriver(driverId).stream().anyMatch(l ->
                requiredClasses.contains(l.getCategory()) && l.getStatus() == DriverLicense.LicenseStatus.VALID);
        if (!validLicense) reasons.add("No valid license of required category: " + requiredClasses);
        for (DriverCertification.CertificationType type : CERT_REQUIREMENTS.getOrDefault(normalized, List.of())) {
            boolean found = repository.findCertificationsByDriver(driverId).stream().anyMatch(c ->
                    c.getCertType() == type && c.getStatus() == DriverCertification.CertStatus.VALID);
            if (!found) reasons.add("Missing required certification: " + type);
        }
        return QualificationCheckResponse.builder().driverId(driverId).vehicleCategory(vehicleCategory)
                .qualified(reasons.isEmpty()).reasons(reasons).build();
    }

    @Transactional(readOnly = true)
    public List<DriverLicenseResponse> getMyLicenses(String email) {
        return repository.findLicensesByDriver(driverService.findByEmail(email).getId()).stream()
                .map(this::toSelfLicenseResponse).toList();
    }

    public DriverLicenseResponse addMyLicense(String email, DriverLicenseRequest request) {
        User user = driverService.findByEmail(email);
        DriverLicense saved = repository.saveLicense(buildLicense(user, request));
        readinessService.refreshForDriver(user.getId());
        return toSelfLicenseResponse(saved);
    }

    public DriverLicenseResponse updateMyLicense(String email, Long id, DriverLicenseRequest request) {
        User user = driverService.findByEmail(email);
        DriverLicense license = repository.findLicenseById(id)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + id));
        assertOwner(license.getUser().getId(), user.getId(), "License");
        applyLicenseRequest(license, request);
        readinessService.refreshForDriver(user.getId());
        return toSelfLicenseResponse(repository.saveLicense(license));
    }

    @Transactional(readOnly = true)
    public List<DriverCertification> getMyCertifications(String email) {
        return repository.findCertificationsByDriver(driverService.findByEmail(email).getId());
    }

    public DriverCertification addMyCertification(String email, DriverSelfCertificationRequest request) {
        User user = driverService.findByEmail(email);
        return repository.saveCertification(DriverCertification.builder().user(user)
                .certType(request.getCertType()).certName(request.getCertName()).issuedBy(request.getIssuedBy())
                .issueDate(request.getIssueDate()).expiryDate(request.getExpiryDate()).build());
    }

    private DriverLicense buildLicense(User user, DriverLicenseRequest request) {
        return DriverLicense.builder().user(user).licenseNumber(request.getLicenseNumber())
                .category(request.getCategory()).issuingAuthority(request.getIssuingAuthority())
                .issueDate(request.getIssueDate()).expiryDate(request.getExpiryDate())
                .isPrimary(Boolean.TRUE.equals(request.getIsPrimary())).build();
    }
    private void applyLicenseRequest(DriverLicense license, DriverLicenseRequest request) {
        license.setLicenseNumber(request.getLicenseNumber()); license.setCategory(request.getCategory());
        license.setIssuingAuthority(request.getIssuingAuthority()); license.setIssueDate(request.getIssueDate());
        license.setExpiryDate(request.getExpiryDate());
        if (request.getIsPrimary() != null) license.setIsPrimary(request.getIsPrimary());
    }
    private DriverLicenseResponse toAdminLicenseResponse(DriverLicense l) {
        return DriverLicenseResponse.builder().id(l.getId()).driverId(l.getUser().getId())
                .driverName(l.getUser().getFullName()).licenseNumber(l.getLicenseNumber()).category(l.getCategory())
                .issuingAuthority(l.getIssuingAuthority()).issueDate(l.getIssueDate()).expiryDate(l.getExpiryDate())
                .documentUrl(l.getDocumentUrl()).isPrimary(l.getIsPrimary()).status(l.getStatus()).build();
    }
    private DriverLicenseResponse toSelfLicenseResponse(DriverLicense l) {
        return DriverLicenseResponse.builder().id(l.getId()).driverId(l.getUser() == null ? null : l.getUser().getId())
                .licenseNumber(l.getLicenseNumber()).category(l.getCategory()).issueDate(l.getIssueDate())
                .expiryDate(l.getExpiryDate()).issuingAuthority(l.getIssuingAuthority())
                .isPrimary(l.getIsPrimary()).status(l.getStatus()).build();
    }
    private void assertOwner(UUID owner, UUID requester, String resource) {
        if (!owner.equals(requester)) throw new AuthorizationException(
                "You do not have permission to access this " + resource + ".");
    }
}
