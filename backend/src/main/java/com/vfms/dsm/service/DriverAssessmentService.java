package com.vfms.dsm.service;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.dsm.dto.DriverRequests.EligibilityCheckRequest;
import com.vfms.dsm.dto.DriverResponses.*;
import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverPerformanceScore;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.trip.repository.TripRequestRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DriverAssessmentService {
    private final UserRepository userRepository;
    private final TripRequestRepository tripRequestRepository;
    private final DriverRepository repository;
    private final DriverCredentialService credentialService;
    private final DriverRecordService recordService;
    private final DriverReadinessService readinessService;

    public EligibilityCheckResponse checkEligibility(EligibilityCheckRequest request) {
        List<String> reasons = new ArrayList<>();
        User user = userRepository.findByEmployeeId(request.getEmployeeId()).orElse(null);
        UUID driverId = user == null ? null : user.getId();
        if (user == null || user.getRole() != Role.DRIVER || user.getStatus() != UserStatus.APPROVED)
            reasons.add("Driver not found or not active");
        if (driverId != null) {
            if (tripRequestRepository.findActiveTrip(driverId, LocalDateTime.now()).isPresent())
                reasons.add("Driver is currently on an active trip");
            boolean license = repository.findLicensesByDriver(driverId).stream()
                    .anyMatch(l -> l.getStatus() == DriverLicense.LicenseStatus.VALID);
            if (!license) reasons.add("No valid license found");
            QualificationCheckResponse qualification = credentialService.checkQualification(driverId, request.getVehicleCategory());
            if (!qualification.isQualified()) reasons.addAll(qualification.getReasons());
            if (recordService.hasBlockingInfractions(driverId))
                reasons.add("Driver has unresolved critical infractions");
        }
        return EligibilityCheckResponse.builder().driverId(driverId).vehicleCategory(request.getVehicleCategory())
                .eligible(reasons.isEmpty()).reasons(reasons).build();
    }

    public List<DriverComplianceResponse> getFleetCompliance() {
        return userRepository.findByRoleAndDeletedAtIsNull(Role.DRIVER, Pageable.unpaged()).getContent().stream()
                .map(this::toCompliance).toList();
    }

    public List<DriverPerformanceScore> getScoresByDriver(UUID driverId) {
        return repository.findPerformanceScoresByDriver(driverId);
    }

    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void calculateMonthlyScores() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        List<User> drivers = userRepository
                .findByRoleAndDeletedAtIsNull(Role.DRIVER, Pageable.unpaged())
                .getContent();

        for (User user : drivers) {
            calculateScoreForDriver(user, lastMonth.getYear(), lastMonth.getMonthValue());
        }

        log.info("Monthly performance calculation complete for {} drivers", drivers.size());
    }

    @Transactional
    public DriverPerformanceScore calculateScoreForDriver(User user, int year, int month) {
        long criticalInfractions = repository.countUnresolvedInfractions(
                user.getId(), DriverInfraction.Severity.CRITICAL,
                DriverInfraction.ResolutionStatus.RESOLVED);
        long highInfractions = repository.countUnresolvedInfractions(
                user.getId(), DriverInfraction.Severity.HIGH,
                DriverInfraction.ResolutionStatus.RESOLVED);

        BigDecimal infractionDeduction = BigDecimal.valueOf(criticalInfractions * 20 + highInfractions * 10);
        BigDecimal tripRate = BigDecimal.valueOf(85);
        BigDecimal fuelEfficiency = BigDecimal.valueOf(80);
        BigDecimal feedbackScore = BigDecimal.valueOf(75);
        BigDecimal composite = tripRate.multiply(BigDecimal.valueOf(0.3))
                .add(fuelEfficiency.multiply(BigDecimal.valueOf(0.25)))
                .add(feedbackScore.multiply(BigDecimal.valueOf(0.15)))
                .subtract(infractionDeduction.multiply(BigDecimal.valueOf(0.3)));

        DriverPerformanceScore score = repository.findPerformanceScore(user.getId(), year, month)
                .orElse(DriverPerformanceScore.builder().user(user)
                        .periodYear(year).periodMonth(month).build());
        score.setTripCompletionRate(tripRate);
        score.setFuelEfficiencyRatio(fuelEfficiency);
        score.setInfractionDeduction(infractionDeduction);
        score.setFeedbackScore(feedbackScore);
        score.setCompositeScore(composite.max(BigDecimal.ZERO));
        return repository.savePerformanceScore(score);
    }

    private DriverComplianceResponse toCompliance(User user) {
        DriverReadinessCache cache = readinessService.getReadiness(user.getId());
        int score = 100;
        if (!Boolean.TRUE.equals(cache.getLicenseValid())) score -= 40;
        if (!Boolean.TRUE.equals(cache.getAllCertsValid())) score -= 30;
        if (Boolean.TRUE.equals(cache.getOnLeaveToday())) score -= 10;
        return DriverComplianceResponse.builder().driverId(user.getId()).driverName(user.getFullName())
                .employeeId(user.getEmployeeId()).licenseExpiry(user.getLicenseExpiryDate())
                .licenseValid(Boolean.TRUE.equals(cache.getLicenseValid()))
                .allCertsValid(Boolean.TRUE.equals(cache.getAllCertsValid()))
                .onLeaveToday(Boolean.TRUE.equals(cache.getOnLeaveToday()))
                .complianceScore(Math.max(0, score)).notReadyReason(cache.getNotReadyReason()).build();
    }
}
