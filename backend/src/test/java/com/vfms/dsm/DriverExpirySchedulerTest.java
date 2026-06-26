package com.vfms.dsm;

import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.dsm.repository.NotificationLogRepository;
import com.vfms.dsm.scheduler.CertificationExpiryScheduler;
import com.vfms.dsm.scheduler.LicenseExpiryScheduler;
import com.vfms.user.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverExpirySchedulerTest {
    @Mock DriverRepository repository;
    @Mock NotificationLogRepository notifications;

    @Test
    void licenseExpiryPersistsTheChangedJsonValue() {
        DriverLicense license = DriverLicense.builder().user(User.builder().id(UUID.randomUUID()).build())
                .licenseNumber("L-1").expiryDate(LocalDate.now().minusDays(1)).build();
        when(repository.findExpiredLicenses(any(), eq(DriverLicense.LicenseStatus.EXPIRED))).thenReturn(List.of(license));
        when(repository.findLicensesExpiringBetween(any(), any())).thenReturn(List.of());

        new LicenseExpiryScheduler(repository, notifications).checkLicenseExpiry();

        verify(repository).saveLicense(license);
        verify(notifications).save(any());
    }

    @Test
    void certificationExpiryPersistsTheChangedJsonValue() {
        DriverCertification certification = DriverCertification.builder()
                .user(User.builder().id(UUID.randomUUID()).build()).certName("Safety")
                .expiryDate(LocalDate.now().minusDays(1)).build();
        when(repository.findExpiredCertifications(any(), eq(DriverCertification.CertStatus.EXPIRED)))
                .thenReturn(List.of(certification));
        when(repository.findCertificationsExpiringBetween(any(), any())).thenReturn(List.of());

        new CertificationExpiryScheduler(repository, notifications).checkCertificationExpiry();

        verify(repository).saveCertification(certification);
        verify(notifications).save(any());
    }
}
