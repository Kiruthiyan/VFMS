package com.vfms.dsm.repository;

import com.vfms.dsm.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;
import java.util.UUID;

public interface DriverRepository extends JpaRepository<Driver, UUID>, JpaSpecificationExecutor<Driver> {
    Optional<Driver> findByEmployeeId(String employeeId);
    Optional<Driver> findByNic(String nic);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByNic(String nic);

    @org.springframework.data.jpa.repository.Query("""
            select d.id as id, d.fullName as fullName
            from Driver d
            where d.status = com.vfms.dsm.entity.Driver.DriverStatus.ACTIVE
            """)
    java.util.List<com.vfms.fuel.dto.FuelMetadataDriverProjection> findFuelMetadataDrivers();
}
