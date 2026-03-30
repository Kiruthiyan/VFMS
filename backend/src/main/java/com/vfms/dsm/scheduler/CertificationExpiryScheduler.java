package com.vfms.dsm.scheduler;

import com.vfms.dsm.entity.DriverCertification;
import com.vfms.dsm.entity.NotificationLog;
import com.vfms.dsm.repository.DriverCertificationRepository;
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
public class CertificationExpiryScheduler {
    private final DriverCertificationRepository certRepository;
    private final NotificationLogRepository notificationLogRepository;

    @Scheduled(cron = "0 0 6 * * *")
    @Transactional
    public void checkCertificationExpiry() {
        LocalDate today = LocalDate.now();

        List<DriverCertification> expired = certRepository.findByExpiryDateBeforeAndStatusNot(
                today,
                DriverCertification.CertStatus.EXPIRED
        );
        for (DriverCertification cert : expired) {
            cert.setStatus(DriverCertification.CertStatus.EXPIRED);
            saveNotification(
                    cert.getDriver().getId(),
                    "CERT_EXPIRED",
                    "Certification '" + cert.getCertName() + "' has expired."
            );
        }

        List<DriverCertification> expiringSoon = certRepository.findExpiringBetween(today, today.plusDays(30));
        for (DriverCertification cert : expiringSoon) {
            if (cert.getStatus() != DriverCertification.CertStatus.EXPIRED) {
                cert.setStatus(DriverCertification.CertStatus.EXPIRING_SOON);
                saveNotification(
                        cert.getDriver().getId(),
                        "CERT_EXPIRING_SOON",
                        "Certification '" + cert.getCertName() + "' expires on " + cert.getExpiryDate()
                );
            }
        }

        log.info(
                "Certification expiry check done. Expired: {}, Expiring soon: {}",
                expired.size(),
                expiringSoon.size()
        );
    }

    private void saveNotification(UUID driverId, String type, String message) {
        notificationLogRepository.save(
                NotificationLog.builder()
                        .entityType("DRIVER")
                        .entityId(driverId)
                        .notificationType(type)
                        .message(message)
                        .build()
        );
    }
}
