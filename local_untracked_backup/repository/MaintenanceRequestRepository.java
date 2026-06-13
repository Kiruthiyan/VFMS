package com.vfms.repository;

import com.vfms.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Long> {

    @Query("SELECT SUM(m.actualCost) FROM MaintenanceRequest m WHERE m.status = 'CLOSED'")
    Double getTotalMaintenanceCost();

    @Query("SELECT SUM(m.downtimeHours) FROM MaintenanceRequest m")
    Integer getTotalDowntime();
}
