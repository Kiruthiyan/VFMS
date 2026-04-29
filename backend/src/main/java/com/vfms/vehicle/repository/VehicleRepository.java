package com.vfms.vehicle.repository;

import com.vfms.fuel.dto.FuelMetadataVehicleProjection;
import com.vfms.common.enums.VehicleStatus;
import com.vfms.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByStatus(VehicleStatus status);
    boolean existsByPlateNumber(String plateNumber);

    @Query("""
            select v.id as id, v.plateNumber as plateNumber, v.make as make, v.model as model
            from Vehicle v
            where v.active = true
              and v.status = com.vfms.common.enums.VehicleStatus.AVAILABLE
            """)
    List<FuelMetadataVehicleProjection> findFuelMetadataVehicles();
}
