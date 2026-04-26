package com.vfms.driver.repository;

import com.vfms.common.enums.DriverStatus;
import com.vfms.driver.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriverRepository extends JpaRepository<Driver, UUID> {
    List<Driver> findByStatus(DriverStatus status);
}
