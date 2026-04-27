package com.vfms.repository;

import com.vfms.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DriverRepository extends JpaRepository<Driver, java.util.UUID> {

    @Query("SELECT AVG(d.rating) FROM Driver d")
    Double getAveragePerformance();

    List<Driver> findByLicenseStatus(String status);
}
