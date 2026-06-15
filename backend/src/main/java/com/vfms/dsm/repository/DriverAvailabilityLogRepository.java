package com.vfms.dsm.repository;
import com.vfms.dsm.entity.DriverAvailabilityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DriverAvailabilityLogRepository extends JpaRepository<DriverAvailabilityLog, Long> {
    // Deprecated
}
