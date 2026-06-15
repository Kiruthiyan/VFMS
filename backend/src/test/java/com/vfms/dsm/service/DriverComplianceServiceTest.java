package com.vfms.dsm.service;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.dsm.dto.DriverComplianceResponse;
import com.vfms.dsm.entity.DriverReadinessCache;
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

    @InjectMocks
    private DriverComplianceService complianceService;

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
}
