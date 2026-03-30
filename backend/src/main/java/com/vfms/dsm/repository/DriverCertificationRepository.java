package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DriverCertificationRepository extends JpaRepository<DriverCertification, Long> {
    List<DriverCertification> findByDriver_Id(UUID driverId);

    List<DriverCertification> findByExpiryDateBeforeAndStatusNot(LocalDate date, DriverCertification.CertStatus status);

    @Query("SELECT c FROM DriverCertification c WHERE c.expiryDate BETWEEN :from AND :to AND c.status != 'EXPIRED'")
    List<DriverCertification> findExpiringBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
