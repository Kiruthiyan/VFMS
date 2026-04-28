package com.vfms.dsm.service;

import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverCertification;
import com.vfms.dsm.entity.DriverLicense;
import com.vfms.dsm.entity.DriverReadinessCache;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverAvailabilityRepository;
import com.vfms.dsm.repository.DriverCertificationRepository;
import com.vfms.dsm.repository.DriverLicenseRepository;
import com.vfms.dsm.repository.DriverReadinessCacheRepository;
import com.vfms.dsm.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverReadinessService {

    private final DriverReadinessCacheRepository cacheRepository;
    private final DriverRepository driverRepository;
    private final DriverLicenseRepository licenseRepository;
    private final DriverCertificationRepository certRepository;
    private final DriverAvailabilityRepository availabilityRepository;

    public DriverReadinessCache getReadiness(UUID driverId) {
        return cacheRepository.findById(driverId).orElseGet(() -> refreshForDriver(driverId));
    }

    public List<DriverReadinessCache> getAvailableReadyDrivers() {
                return cacheRepository.findAllByOrderByLastRefreshedDesc().stream()
                                .filter(DriverReadinessCache::isReady)
                .toList();
    }

        public List<DriverReadinessCache> getAllReadiness() {
                                return driverRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")).stream()
                                .map(driver -> cacheRepository.findById(driver.getId()).orElseGet(() -> refreshForDriver(driver.getId())))
                                .toList();
        }

    @Scheduled(cron = "0 */30 * * * *")
    public void refreshAllReadiness() {
        driverRepository.findAll().forEach(d -> refreshForDriver(d.getId()));
    }

    public DriverReadinessCache refreshForDriver(UUID driverId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));

        DriverLicense latestLicense = licenseRepository.findByDriver_IdOrderByCreatedAtDesc(driverId).stream()
            .findFirst()
            .orElse(null);

        boolean licenseValid = latestLicense != null
            && latestLicense.getStatus() != DriverLicense.LicenseStatus.EXPIRED
            && !latestLicense.getExpiryDate().isBefore(java.time.LocalDate.now());

        boolean certsValid = certRepository.findByDriver_IdOrderByCreatedAtDesc(driverId).stream()
                .noneMatch(c -> c.getStatus() == DriverCertification.CertStatus.EXPIRED);

        DriverAvailability.AvailabilityStatus status = availabilityRepository.findById(driverId)
                .map(DriverAvailability::getStatus)
                .orElse(DriverAvailability.AvailabilityStatus.AVAILABLE);

                DriverReadinessCache cache = cacheRepository.findById(driverId).orElseGet(() -> {
                        DriverReadinessCache newCache = new DriverReadinessCache();
                        newCache.setDriver(driver);
                        return newCache;
                });

                cache.setLicenseValid(licenseValid);
                cache.setAllCertsValid(certsValid);
                cache.setAvailabilityStatus(status);
                cache.setLastRefreshed(LocalDateTime.now());

                return cacheRepository.saveAndFlush(cache);
    }
}
