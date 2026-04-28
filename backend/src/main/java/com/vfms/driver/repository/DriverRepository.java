package com.vfms.driver.repository;

import com.vfms.common.enums.DriverStatus;
import com.vfms.driver.entity.Driver;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface DriverRepository extends JpaRepository<Driver, UUID> {
    List<Driver> findByStatus(DriverStatus status);

    @Query("""
            select d.id as id, d.fullName as fullName
            from Driver d
            """)
    List<FuelMetadataDriverProjection> findFuelMetadataDrivers();
}
