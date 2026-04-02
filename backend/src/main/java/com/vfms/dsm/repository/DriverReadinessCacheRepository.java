package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverReadinessCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverReadinessCacheRepository extends JpaRepository<DriverReadinessCache, UUID> {

    List<DriverReadinessCache> findByAvailabilityStatus(DriverAvailability.AvailabilityStatus status);

    List<DriverReadinessCache> findByLicenseValidAndAllCertsValid(Boolean licenseValid, Boolean allCertsValid);
}
