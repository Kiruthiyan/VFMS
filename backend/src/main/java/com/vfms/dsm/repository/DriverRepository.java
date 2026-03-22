package com.vfms.dsm.repository;

import com.vfms.dsm.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long>, JpaSpecificationExecutor<Driver> {
    Optional<Driver> findByEmployeeId(String employeeId);
    Optional<Driver> findByNic(String nic);
    boolean existsByEmployeeId(String employeeId);
    boolean existsByNic(String nic);
}
