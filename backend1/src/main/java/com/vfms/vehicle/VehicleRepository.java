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
}
