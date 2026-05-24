package com.vfms.maintenance;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceRequest, Long> {

    List<MaintenanceRequest> findByStatus(MaintenanceStatus status);

    List<MaintenanceRequest> findByVehicleId(Long vehicleId);

    List<MaintenanceRequest> findByStatusIn(List<MaintenanceStatus> statuses);
}
