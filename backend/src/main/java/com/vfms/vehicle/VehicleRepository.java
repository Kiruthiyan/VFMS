package com.vfms.vehicle;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByPlateNumber(String plateNumber);

    boolean existsByPlateNumber(String plateNumber);

    List<Vehicle> findByActiveTrue();

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByStatusAndActiveTrue(VehicleStatus status);

    List<Vehicle> findByVehicleTypeAndActiveTrue(VehicleType vehicleType);

    @org.springframework.data.jpa.repository.Query("""
            select v.id as id, v.plateNumber as plateNumber, v.brand as make, v.model as model
            from Vehicle v
            where v.active = true
              and v.status = com.vfms.vehicle.VehicleStatus.AVAILABLE
            """)
    List<com.vfms.fuel.dto.FuelMetadataVehicleProjection> findFuelMetadataVehicles();
}
