package com.vfms.vehicle.repository;

import com.vfms.common.enums.VehicleStatus;
import com.vfms.vehicle.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {
    List<Vehicle> findByStatus(VehicleStatus status);
    boolean existsByPlateNumber(String plateNumber);
}
