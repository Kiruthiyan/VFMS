package com.vfms.dsm.service;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.dsm.dto.DriverResponses.DriverComplianceResponse;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverPerformanceScore;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverComplianceServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DriverReadinessService readinessService;

    @Mock
    private DriverRepository driverRepository;

    @InjectMocks
    private DriverAssessmentService complianceService;

    @Test
    void getFleetCompliance_computesScoreFromReadiness() {
        UUID driverId = UUID.randomUUID();
        User driver = User.builder()
                .id(driverId)
                .fullName("Test Driver")
                .employeeId("DRV-0001")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .licenseExpiryDate(LocalDate.now().plusMonths(6))
                .build();

        DriverReadinessCache cache = DriverReadinessCache.builder()
                .userId(driverId)
                .licenseValid(true)
                .allCertsValid(true)
                .onLeaveToday(false)
                .build();

        when(userRepository.findByRoleAndDeletedAtIsNull(eq(Role.DRIVER), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(driver)));
        when(readinessService.getReadiness(driverId)).thenReturn(cache);

        List<DriverComplianceResponse> result = complianceService.getFleetCompliance();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getComplianceScore()).isEqualTo(100);
        assertThat(result.get(0).getDriverName()).isEqualTo("Test Driver");
    }

    @Test
    void getFleetCompliance_deductsForExpiredLicense() {
        UUID driverId = UUID.randomUUID();
        User driver = User.builder()
                .id(driverId)
                .fullName("Expired Driver")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .licenseExpiryDate(LocalDate.now().minusDays(1))
                .build();

        DriverReadinessCache cache = DriverReadinessCache.builder()
                .userId(driverId)
                .licenseValid(false)
                .allCertsValid(true)
                .onLeaveToday(false)
                .notReadyReason("License expired")
                .build();

        when(userRepository.findByRoleAndDeletedAtIsNull(eq(Role.DRIVER), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(driver)));
        when(readinessService.getReadiness(driverId)).thenReturn(cache);

        List<DriverComplianceResponse> result = complianceService.getFleetCompliance();

        assertThat(result.get(0).getComplianceScore()).isEqualTo(60);
        assertThat(result.get(0).isLicenseValid()).isFalse();
    }

    @Test
    void calculateScoreForDriver_preservesPerformanceCalculation() {
        User driver = User.builder().id(UUID.randomUUID()).build();
        when(driverRepository.countUnresolvedInfractions(
                driver.getId(), DriverInfraction.Severity.CRITICAL,
                DriverInfraction.ResolutionStatus.RESOLVED)).thenReturn(1L);
        when(driverRepository.countUnresolvedInfractions(
                driver.getId(), DriverInfraction.Severity.HIGH,
                DriverInfraction.ResolutionStatus.RESOLVED)).thenReturn(1L);
        when(driverRepository.findPerformanceScore(driver.getId(), 2026, 5)).thenReturn(Optional.empty());
        when(driverRepository.savePerformanceScore(any(DriverPerformanceScore.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DriverPerformanceScore result = complianceService.calculateScoreForDriver(driver, 2026, 5);

        assertThat(result.getPeriodYear()).isEqualTo(2026);
        assertThat(result.getPeriodMonth()).isEqualTo(5);
        assertThat(result.getInfractionDeduction()).isEqualByComparingTo("30");
        assertThat(result.getCompositeScore()).isEqualByComparingTo("47.75");
    }
}
