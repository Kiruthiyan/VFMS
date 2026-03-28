package com.vfms.maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);

    List<MaintenanceRequest> findByVehicleId(Long vehicleId);

    List<MaintenanceRequest> findByStatusIn(List<MaintenanceStatus> statuses);
}

