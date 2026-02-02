package com.vfms.vehicle.repository;

import com.vfms.vehicle.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    Optional<Vehicle> findByLicensePlate(String licensePlate);
}
