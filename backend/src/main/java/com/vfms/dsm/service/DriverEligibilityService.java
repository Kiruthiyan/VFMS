package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.EligibilityCheckRequest;
import com.vfms.dsm.dto.EligibilityCheckResponse;
import com.vfms.dsm.dto.QualificationCheckResponse;

import com.vfms.dsm.entity.DriverLicense;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.trip.repository.TripRequestRepository;
import com.vfms.dsm.repository.DriverLicenseRepository;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service @RequiredArgsConstructor @Transactional(readOnly = true)
public class DriverEligibilityService {
    private final UserRepository userRepository;
    private final TripRequestRepository tripRequestRepository;
    private final DriverLicenseRepository licenseRepository;
    private final DriverQualificationService qualificationService;
    private final DriverInfractionService infractionService;

    public EligibilityCheckResponse checkEligibility(EligibilityCheckRequest request) {
        List<String> reasons = new ArrayList<>();
        String employeeId = request.getEmployeeId();
        User user = userRepository.findByEmployeeId(employeeId).orElse(null);
        UUID driverId = user == null ? null : user.getId();

        if (user == null || user.getRole() != Role.DRIVER || user.getStatus() != UserStatus.APPROVED) {
            reasons.add("Driver not found or not active");
        }

        if (driverId != null) {
            boolean hasActiveTrip = tripRequestRepository.findActiveTrip(driverId, java.time.LocalDateTime.now()).isPresent();
            if (hasActiveTrip) {
                reasons.add("Driver is currently on an active trip");
            }

            boolean hasValidLicense = licenseRepository.findByUser_IdOrderByCreatedAtDesc(driverId).stream()
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
