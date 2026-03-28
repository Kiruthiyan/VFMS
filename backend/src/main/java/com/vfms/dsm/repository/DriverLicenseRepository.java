package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;

public interface DriverLicenseRepository extends JpaRepository<DriverLicense, Long> {
    List<DriverLicense> findByDriverId(Long driverId);
    List<DriverLicense> findByExpiryDateBeforeAndStatusNot(LocalDate date, DriverLicense.LicenseStatus status);

    @Query("SELECT l FROM DriverLicense l WHERE l.expiryDate BETWEEN :from AND :to AND l.status != 'EXPIRED'")
    List<DriverLicense> findExpiringBetween(LocalDate from, LocalDate to);
}
