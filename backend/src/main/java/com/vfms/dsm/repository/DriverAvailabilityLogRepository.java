package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverAvailabilityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverAvailabilityLogRepository extends JpaRepository<DriverAvailabilityLog, Long> {
    List<DriverAvailabilityLog> findByDriverIdOrderByChangedAtDesc(UUID driverId);
}
