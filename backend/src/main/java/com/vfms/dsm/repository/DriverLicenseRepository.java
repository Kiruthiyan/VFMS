package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface DriverLicenseRepository extends JpaRepository<DriverLicense, Long> {

    List<DriverLicense> findByExpiryDateBeforeAndStatusNot(LocalDate date, DriverLicense.LicenseStatus status);

    @Query("""
            SELECT dl
            FROM DriverLicense dl
            WHERE dl.expiryDate BETWEEN :startDate AND :endDate
            """)
    List<DriverLicense> findExpiringBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
