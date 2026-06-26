package com.vfms.dsm.service;

import com.vfms.user.entity.User;
import com.vfms.common.enums.Role;

import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.user.repository.UserRepository;
import com.vfms.trip.repository.TripRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverReadinessService {

    private final DriverRepository cacheRepository;
    private final UserRepository userRepository;
    private final DriverRepository licenseRepository;
    private final DriverRepository certRepository;
    private final TripRequestRepository tripRequestRepository;
    private final DriverRepository leaveRepository;

    public DriverReadinessCache getReadiness(UUID driverId) {
        return cacheRepository.findReadiness(driverId).orElseGet(() -> refreshForDriver(driverId));
    }

    public List<DriverReadinessCache> getAvailableReadyDrivers() {
                return cacheRepository.findAllReadiness().stream()
                                .filter(DriverReadinessCache::isReady)
                .toList();
    }

    public List<DriverReadinessCache> getAllReadiness() {
        return driverUsers().stream()
                .map(user -> refreshForDriver(user.getId()))
                .toList();
    }

    @Scheduled(cron = "0 */30 * * * *")
    public void refreshAllReadiness() {
        driverUsers().forEach(driver -> refreshForDriver(driver.getId()));
    }

    public DriverReadinessCache refreshForDriver(UUID driverId) {
        User user = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));
        if (user.getRole() != Role.DRIVER || user.getDeletedAt() != null) {
            throw new ResourceNotFoundException("Driver not found: " + driverId);
        }

        boolean licenseValid = user.getLicenseExpiryDate() != null
            && !user.getLicenseExpiryDate().isBefore(LocalDate.now());

        boolean certsValid = certRepository.findCertificationsByDriver(driverId).stream()
                .noneMatch(c -> c.getStatus() == DriverCertification.CertStatus.EXPIRED);

        // Check for approved leave on the current date
        boolean onLeaveToday = leaveRepository.hasApprovedLeaveOnDate(driverId, LocalDate.now());

        // Build not-ready reason
        List<String> reasons = new ArrayList<>();
        if (!licenseValid) reasons.add("License expired");
        if (onLeaveToday) reasons.add("On approved leave");
        String notReadyReason = reasons.isEmpty() ? null : String.join(", ", reasons);

        DriverReadinessCache cache = cacheRepository.findReadiness(driverId).orElseGet(() -> {
                DriverReadinessCache newCache = new DriverReadinessCache();
                newCache.setUser(user);
                return newCache;
        });

        cache.setLicenseValid(licenseValid);
        cache.setAllCertsValid(certsValid);
        cache.setOnLeaveToday(onLeaveToday);
        cache.setNotReadyReason(notReadyReason);
        cache.setLastRefreshed(LocalDateTime.now());

        return cacheRepository.saveReadiness(cache);
    }

    private List<User> driverUsers() {
        return userRepository.findByRoleAndDeletedAtIsNull(Role.DRIVER, Pageable.unpaged()).getContent();
    }
}
