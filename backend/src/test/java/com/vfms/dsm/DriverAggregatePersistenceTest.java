package com.vfms.dsm;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.entity.DriverAggregate.DriverLicense;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class DriverAggregatePersistenceTest {
    @Autowired private UserRepository userRepository;
    @Autowired private DriverRepository driverRepository;

    @Test
    void persistsDriverResourcesInsideSingleAggregateRow() {
        User driver = userRepository.saveAndFlush(User.builder()
                .fullName("Aggregate Test Driver")
                .email("aggregate-driver@example.test")
                .password(generatedPassword())
                .phone("0700000000")
                .nic("AGGREGATE-TEST-NIC")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .employeeId("AGG-001")
                .enabled(true)
                .build());

        DriverLicense license = driverRepository.saveLicense(DriverLicense.builder()
                .user(driver)
                .licenseNumber("AGG-LICENSE-001")
                .category(DriverLicense.LicenseCategory.B)
                .issueDate(LocalDate.now().minusYears(1))
                .expiryDate(LocalDate.now().plusYears(1))
                .build());

        assertThat(license.getId()).isNotNull();
        assertThat(driverRepository.findLicensesByDriver(driver.getId()))
                .extracting(DriverLicense::getLicenseNumber)
                .containsExactly("AGG-LICENSE-001");

        license.setIssuingAuthority("Updated Authority");
        driverRepository.saveLicense(license);
        assertThat(driverRepository.findLicenseById(license.getId()))
                .get()
                .extracting(DriverLicense::getIssuingAuthority)
                .isEqualTo("Updated Authority");

        driverRepository.saveReadiness(DriverReadinessCache.builder()
                .userId(driver.getId())
                .user(driver)
                .licenseValid(true)
                .allCertsValid(true)
                .onLeaveToday(false)
                .lastRefreshed(LocalDateTime.now())
                .build());
        assertThat(driverRepository.findReadiness(driver.getId()))
                .get()
                .extracting(DriverReadinessCache::getLicenseValid)
                .isEqualTo(true);

        driverRepository.deleteLicense(license);
        assertThat(driverRepository.findLicenseById(license.getId())).isEmpty();
    }

    @Test
    void persistsSupabaseDocumentMetadataInJsonb() {
        User driver = userRepository.saveAndFlush(User.builder()
                .fullName("Document Metadata Driver")
                .email("document-driver@example.test")
                .password(generatedPassword())
                .phone("0711111111")
                .nic("DOCUMENT-TEST-NIC")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .employeeId("DOC-001")
                .enabled(true)
                .build());

        DriverDocument supabase = driverRepository.saveDocument(DriverDocument.builder()
                .user(driver)
                .entityType(DriverDocument.DocumentEntityType.LICENSE)
                .fileName("License")
                .originalFileName("license.pdf")
                .bucketName("driver-documents")
                .storagePath("drivers/" + driver.getId() + "/documents/license/file.pdf")
                .storageProvider(DriverDocument.StorageProvider.SUPABASE)
                .mimeType("application/pdf")
                .fileSize(456L)
                .uploadedAt(LocalDateTime.now())
                .build());

        assertThat(driverRepository.findDocumentsByDriver(driver.getId()))
                .extracting(DriverDocument::getId)
                .containsExactly(supabase.getId());

        assertThat(driverRepository.findDocumentById(supabase.getId()))
                .get()
                .satisfies(document -> {
                    assertThat(document.getBucketName()).isEqualTo("driver-documents");
                    assertThat(document.getStoragePath()).contains("/documents/license/");
                    assertThat(document.getStorageProvider()).isEqualTo(DriverDocument.StorageProvider.SUPABASE);
                    assertThat(document.getOriginalFileName()).isEqualTo("license.pdf");
                });
    }

    private String generatedPassword() {
        return UUID.randomUUID().toString();
    }
}
