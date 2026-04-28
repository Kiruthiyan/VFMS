package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverInfraction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverInfractionRepository extends JpaRepository<DriverInfraction, Long> {

    List<DriverInfraction> findByDriverIdOrderByCreatedAtDesc(UUID driverId);

    List<DriverInfraction> findByDriverIdAndResolutionStatusOrderByCreatedAtDesc(UUID driverId, DriverInfraction.ResolutionStatus status);

    long countByDriverIdAndSeverityAndResolutionStatusNot(
            UUID driverId,
            DriverInfraction.Severity severity,
            DriverInfraction.ResolutionStatus status
    );
}
