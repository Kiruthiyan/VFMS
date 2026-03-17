package com.vfms.vehicle.service;

import com.vfms.vehicle.model.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;

    // Get all vehicles with pagination
    @Transactional(readOnly = true)
    public Page<Vehicle> getAllVehicles(Pageable pageable) {
        return vehicleRepository.findAll(pageable);
    }

    // Get all vehicles
    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    // Get all active vehicles
    @Transactional(readOnly = true)
    public List<Vehicle> getActiveVehicles() {
        return vehicleRepository.findByStatus("ACTIVE");
    }

    // Get active vehicles with pagination
    @Transactional(readOnly = true)
    public Page<Vehicle> getActiveVehicles(Pageable pageable) {
        return vehicleRepository.findByStatus("ACTIVE", pageable);
    }

    // Get vehicle by ID
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleById(Integer id) {
        return vehicleRepository.findById(id);
    }

    // Get vehicle by license plate
    @Transactional(readOnly = true)
    public Optional<Vehicle> getVehicleByPlate(String licensePlate) {
        return vehicleRepository.findByLicensePlate(licensePlate);
    }

    // Create new vehicle
    @Transactional
    public Vehicle createVehicle(Vehicle vehicle) {
        log.info("Creating new vehicle: {} {}", vehicle.getMake(), vehicle.getModel());
        vehicle.setStatus("ACTIVE");
        vehicle.setCreatedAt(LocalDate.now());
        vehicle.setUpdatedAt(LocalDate.now());
        return vehicleRepository.save(vehicle);
    }

    // Update vehicle
    @Transactional
    public Vehicle updateVehicle(Integer id, Vehicle vehicleDetails) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        
        if (vehicleDetails.getMake() != null) {
            vehicle.setMake(vehicleDetails.getMake());
        }
        if (vehicleDetails.getModel() != null) {
            vehicle.setModel(vehicleDetails.getModel());
        }
        if (vehicleDetails.getYearOfManufacture() != null) {
            vehicle.setYearOfManufacture(vehicleDetails.getYearOfManufacture());
        }
        if (vehicleDetails.getFuelType() != null) {
            vehicle.setFuelType(vehicleDetails.getFuelType());
        }
        if (vehicleDetails.getVehicleType() != null) {
            vehicle.setVehicleType(vehicleDetails.getVehicleType());
        }
        if (vehicleDetails.getCurrentOdometer() != null) {
            vehicle.setCurrentOdometer(vehicleDetails.getCurrentOdometer());
        }
        if (vehicleDetails.getStatus() != null) {
            vehicle.setStatus(vehicleDetails.getStatus());
        }
        if (vehicleDetails.getLastServiceDate() != null) {
            vehicle.setLastServiceDate(vehicleDetails.getLastServiceDate());
        }
        if (vehicleDetails.getNotes() != null) {
            vehicle.setNotes(vehicleDetails.getNotes());
        }
        
        vehicle.setUpdatedAt(LocalDate.now());
        log.info("Updated vehicle: {}", vehicle.getLicensePlate());
        return vehicleRepository.save(vehicle);
    }

    // Delete vehicle
    @Transactional
    public void deleteVehicle(Integer id) {
        vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicleRepository.deleteById(id);
        log.info("Deleted vehicle with id: {}", id);
    }

    // Deactivate vehicle
    @Transactional
    public Vehicle deactivateVehicle(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicle.setStatus("INACTIVE");
        vehicle.setUpdatedAt(LocalDate.now());
        log.info("Deactivated vehicle: {}", vehicle.getLicensePlate());
        return vehicleRepository.save(vehicle);
    }

    // Activate vehicle
    @Transactional
    public Vehicle activateVehicle(Integer id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
        vehicle.setStatus("ACTIVE");
        vehicle.setUpdatedAt(LocalDate.now());
        log.info("Activated vehicle: {}", vehicle.getLicensePlate());
        return vehicleRepository.save(vehicle);
    }

    // Search vehicles
    @Transactional(readOnly = true)
    public Page<Vehicle> searchVehicles(String query, Pageable pageable) {
        return vehicleRepository.findByMakeIgnoreCaseContainingOrModelIgnoreCaseContainingOrLicensePlateIgnoreCaseContaining(
                query, query, query, pageable);
    }

    // Get vehicles by fuel type
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByFuelType(String fuelType) {
        return vehicleRepository.findByFuelType(fuelType);
    }

    // Get vehicles by vehicle type
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByType(String vehicleType) {
        return vehicleRepository.findByVehicleType(vehicleType);
    }

    // Count all vehicles
    @Transactional(readOnly = true)
    public long countAllVehicles() {
        return vehicleRepository.count();
    }

    // Count active vehicles
    @Transactional(readOnly = true)
    public long countActiveVehicles() {
        return vehicleRepository.countByStatus("ACTIVE");
    }
}
