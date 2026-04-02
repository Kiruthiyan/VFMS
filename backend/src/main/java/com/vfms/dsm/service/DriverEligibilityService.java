package com.vfms.dsm.service;

import com.vfms.dsm.dto.EligibilityCheckRequest;
import com.vfms.dsm.dto.EligibilityCheckResponse;
import com.vfms.dsm.dto.QualificationCheckResponse;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverLicense;
import com.vfms.dsm.repository.DriverAvailabilityRepository;
import com.vfms.dsm.repository.DriverLicenseRepository;
import com.vfms.dsm.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class DriverEligibilityService {
    private final DriverRepository driverRepository;
    private final DriverAvailabilityRepository availabilityRepository;
    private final DriverLicenseRepository licenseRepository;
    private final DriverQualificationService qualificationService;
    private final DriverInfractionService infractionService;

    public EligibilityCheckResponse checkEligibility(EligibilityCheckRequest request) {
        List<String> reasons = new ArrayList<>();
        String employeeId = request.getEmployeeId();
        Driver driver = driverRepository.findByEmployeeId(employeeId).orElse(null);
        UUID driverId = driver == null ? null : driver.getId();

        if (driver == null || driver.getStatus() != Driver.DriverStatus.ACTIVE) {
            reasons.add("Driver not found or not active");
        }

        if (driverId != null) {
            availabilityRepository.findById(driverId).ifPresentOrElse(avail -> {
            if (avail.getStatus() != DriverAvailability.AvailabilityStatus.AVAILABLE) {
                reasons.add("Driver is not available: " + avail.getStatus());
            }
            }, () -> reasons.add("Availability record not found"));

            boolean hasValidLicense = licenseRepository.findByDriver_Id(driverId).stream()
                .anyMatch(l -> l.getStatus() == DriverLicense.LicenseStatus.VALID);
            if (!hasValidLicense) {
                reasons.add("No valid license found");
            }

            QualificationCheckResponse qual = qualificationService.checkQualification(driverId, request.getVehicleCategory());
            if (!qual.isQualified()) {
                reasons.addAll(qual.getReasons());
            }

            if (infractionService.hasBlockingInfractions(driverId)) {
                reasons.add("Driver has unresolved critical infractions");
            }
        }

        return EligibilityCheckResponse.builder()
            .driverId(driverId)
            .vehicleCategory(request.getVehicleCategory())
            .eligible(reasons.isEmpty())
            .reasons(reasons)
            .build();
    }
}
