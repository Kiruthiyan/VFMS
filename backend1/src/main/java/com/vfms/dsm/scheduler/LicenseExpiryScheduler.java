package com.vfms.dsm.scheduler;

import com.vfms.dsm.entity.DriverLicense;
import com.vfms.dsm.entity.NotificationLog;
import com.vfms.dsm.repository.DriverLicenseRepository;
import com.vfms.dsm.repository.NotificationLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class LicenseExpiryScheduler {
    private final DriverLicenseRepository licenseRepository;
    private final NotificationLogRepository notificationLogRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void checkLicenseExpiry() {
        LocalDate today = LocalDate.now();

        List<DriverLicense> expiredLicenses = licenseRepository.findByExpiryDateBeforeAndStatusNot(
                today,
                DriverLicense.LicenseStatus.EXPIRED
        );
        for (DriverLicense license : expiredLicenses) {
            license.setStatus(DriverLicense.LicenseStatus.EXPIRED);
            logNotification(
                    license.getDriver().getId(),
                    "LICENSE_EXPIRED",
                    "License " + license.getLicenseNumber() + " has expired."
            );
        }

        List<DriverLicense> expiringSoon = licenseRepository.findExpiringBetween(today, today.plusDays(30));
        for (DriverLicense license : expiringSoon) {
            if (license.getStatus() != DriverLicense.LicenseStatus.EXPIRED) {
                license.setStatus(DriverLicense.LicenseStatus.EXPIRING_SOON);
                logNotification(
                        license.getDriver().getId(),
                        "LICENSE_EXPIRING_SOON",
                        "License " + license.getLicenseNumber() + " expires on " + license.getExpiryDate()
                );
            }
        }

        log.info(
                "License expiry check complete. Expired: {}, Expiring Soon: {}",
                expiredLicenses.size(),
                expiringSoon.size()
        );
    }

    private void logNotification(UUID driverId, String type, String message) {
        NotificationLog log = NotificationLog.builder()
                .entityType("DRIVER")
                .entityId(driverId)
                .notificationType(type)
                .message(message)
                .build();
        notificationLogRepository.save(log);
    }
}
