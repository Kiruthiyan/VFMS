package com.vfms.dsm.service;

import com.vfms.dsm.dto.QualificationCheckResponse;
import com.vfms.dsm.entity.DriverCertification;
import com.vfms.dsm.entity.DriverLicense;
import com.vfms.dsm.repository.DriverCertificationRepository;
import com.vfms.dsm.repository.DriverLicenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class DriverQualificationService {
    private final DriverLicenseRepository licenseRepository;
    private final DriverCertificationRepository certRepository;

    private static final Map<String, List<DriverLicense.LicenseCategory>> VEHICLE_REQUIREMENTS = Map.of(
        "LIGHT",      List.of(DriverLicense.LicenseCategory.B),
        "MEDIUM",     List.of(DriverLicense.LicenseCategory.C),
        "HEAVY",      List.of(DriverLicense.LicenseCategory.CE),
        "PASSENGER",  List.of(DriverLicense.LicenseCategory.D),
        "TANKER",     List.of(DriverLicense.LicenseCategory.CE)
    );

    private static final Map<String, List<DriverCertification.CertificationType>> CERT_REQUIREMENTS = Map.of(
        "TANKER",     List.of(DriverCertification.CertificationType.HAZMAT),
        "PASSENGER",  List.of(DriverCertification.CertificationType.PASSENGER_TRANSPORT),
        "HEAVY",      List.of(DriverCertification.CertificationType.HEAVY_VEHICLE)
    );

    public QualificationCheckResponse checkQualification(UUID driverId, String vehicleCategory) {
        String normalizedCategory = vehicleCategory == null ? "" : vehicleCategory.toUpperCase();
        List<String> reasons = new ArrayList<>();

        List<DriverLicense.LicenseCategory> requiredClasses =
            VEHICLE_REQUIREMENTS.getOrDefault(normalizedCategory, List.of());
        List<DriverLicense> licenses = licenseRepository.findByDriver_IdOrderByCreatedAtDesc(driverId);
        boolean hasValidLicense = licenses.stream().anyMatch(l ->
            requiredClasses.contains(l.getCategory()) && l.getStatus() == DriverLicense.LicenseStatus.VALID);
        if (!hasValidLicense) reasons.add("No valid license of required category: " + requiredClasses);

        List<DriverCertification.CertificationType> requiredCerts =
            CERT_REQUIREMENTS.getOrDefault(normalizedCategory, List.of());
        List<DriverCertification> certs = certRepository.findByDriver_IdOrderByCreatedAtDesc(driverId);
        for (DriverCertification.CertificationType certType : requiredCerts) {
            boolean hasCert = certs.stream().anyMatch(c ->
                c.getCertType() == certType && c.getStatus() == DriverCertification.CertStatus.VALID);
            if (!hasCert) reasons.add("Missing required certification: " + certType);
        }

        return QualificationCheckResponse.builder()
            .driverId(driverId)
            .vehicleCategory(vehicleCategory)
            .qualified(reasons.isEmpty())
            .reasons(reasons)
            .build();
    }
}
