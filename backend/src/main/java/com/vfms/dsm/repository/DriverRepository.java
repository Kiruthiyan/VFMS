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

    // Used by DriverSelfService to resolve the authenticated user's Driver record by email.
    Optional<Driver> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("select d.employeeId from Driver d where d.employeeId like :prefix%")
    java.util.List<String> findAllEmployeeIdsByPrefix(@org.springframework.data.repository.query.Param("prefix") String prefix);

    @org.springframework.data.jpa.repository.Query("""
            select d.id as id, d.fullName as fullName
            from Driver d
            where d.status = com.vfms.dsm.entity.Driver.DriverStatus.ACTIVE
            """)
    java.util.List<com.vfms.fuel.dto.FuelMetadataDriverProjection> findFuelMetadataDrivers();
}
