package com.vfms.dsm.service;

import com.vfms.common.enums.Role;
import com.vfms.dsm.dto.DriverComplianceResponse;
import com.vfms.dsm.entity.DriverReadinessCache;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DriverComplianceService {

    private final UserRepository userRepository;
    private final DriverReadinessService readinessService;

    public List<DriverComplianceResponse> getFleetCompliance() {
        return userRepository.findByRoleAndDeletedAtIsNull(
                Role.DRIVER,
                org.springframework.data.domain.Pageable.unpaged()
        ).getContent().stream()
                .map(this::toCompliance)
                .toList();
    }

    private DriverComplianceResponse toCompliance(User user) {
        DriverReadinessCache cache = readinessService.getReadiness(user.getId());
        int score = computeScore(cache);

        return DriverComplianceResponse.builder()
                .driverId(user.getId())
                .driverName(user.getFullName())
                .employeeId(user.getEmployeeId())
                .licenseExpiry(user.getLicenseExpiryDate())
                .licenseValid(Boolean.TRUE.equals(cache.getLicenseValid()))
                .allCertsValid(Boolean.TRUE.equals(cache.getAllCertsValid()))
                .onLeaveToday(Boolean.TRUE.equals(cache.getOnLeaveToday()))
                .complianceScore(score)
                .notReadyReason(cache.getNotReadyReason())
                .build();
    }

    private int computeScore(DriverReadinessCache cache) {
        int score = 100;
        if (!Boolean.TRUE.equals(cache.getLicenseValid())) {
            score -= 40;
        }
        if (!Boolean.TRUE.equals(cache.getAllCertsValid())) {
            score -= 30;
        }
        if (Boolean.TRUE.equals(cache.getOnLeaveToday())) {
            score -= 10;
        }
        return Math.max(0, score);
    }
}
