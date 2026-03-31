package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverAvailability;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverAvailabilityRepository extends JpaRepository<DriverAvailability, UUID> {
    List<DriverAvailability> findByStatus(DriverAvailability.AvailabilityStatus status);
}
