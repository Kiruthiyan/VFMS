package com.vfms.vehicle.repository;

import com.vfms.vehicle.model.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    
    // Find by license plate (unique constraint)
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    
    // Find all active vehicles
    List<Vehicle> findByStatus(String status);
    
    // Find all active vehicles with pagination
    Page<Vehicle> findByStatus(String status, Pageable pageable);
    
    // Find by make and model
    List<Vehicle> findByMakeAndModel(String make, String model);
    
    // Find by fuel type
    List<Vehicle> findByFuelType(String fuelType);
    Page<Vehicle> findByFuelType(String fuelType, Pageable pageable);
    
    // Find by vehicle type
    List<Vehicle> findByVehicleType(String vehicleType);
    Page<Vehicle> findByVehicleType(String vehicleType, Pageable pageable);
    
    // Count active vehicles
    long countByStatus(String status);
    
    // Search by make or model or license plate
    List<Vehicle> findByMakeIgnoreCaseContainingOrModelIgnoreCaseContainingOrLicensePlateIgnoreCaseContaining(
            String make, String model, String licensePlate);
    
    Page<Vehicle> findByMakeIgnoreCaseContainingOrModelIgnoreCaseContainingOrLicensePlateIgnoreCaseContaining(
            String make, String model, String licensePlate, Pageable pageable);
}
