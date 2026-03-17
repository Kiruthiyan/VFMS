package com.vfms.fuel.service;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.repository.FuelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FuelService {
    private final FuelRepository repository;

    /**
     * Get all fuel records with pagination
     */
    public Page<FuelRecord> getAllFuelRecordsWithPagination(Pageable pageable) {
        log.info("Fetching all fuel records with pagination - Page: {}, Size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        return repository.findAll(pageable);
    }

    /**
     * Get all fuel records without pagination (backward compatibility)
     */
    public List<FuelRecord> getAllFuelRecords() {
        log.info("Fetching all fuel records");
        return repository.findAll();
    }

    /**
     * Get fuel record by ID
     */
    public Optional<FuelRecord> getFuelRecordById(Integer id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Fuel record ID must be a positive integer");
        }
        log.info("Fetching fuel record with ID: {}", id);
        return repository.findById(id);
    }

    /**
     * Add new fuel record with validation
     */
    public FuelRecord addFuelRecord(FuelRecord record) {
<<<<<<< HEAD
        if (record.getQuantity() == null || record.getQuantity() <= 0) {
            throw new IllegalArgumentException("Fuel quantity must be a positive value");
        }
        if (record.getCost() == null || record.getCost() < 0) {
            throw new IllegalArgumentException("Fuel cost cannot be negative");
        }
        if (record.getVehicleId() == null) {
            throw new IllegalArgumentException("Vehicle ID is required");
        }
        
        // Calculate price per liter if not provided
        if (record.getPricePerLiter() == null && record.getCost() != null && record.getQuantity() > 0) {
            record.setPricePerLiter(record.getCost() / record.getQuantity());
        }
        
        return repository.save(record);
=======
        // Validation
        if (record.getVehiclePlate() == null || record.getVehiclePlate().trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle plate is required");
        }
        
        if (record.getQuantity() == null || record.getQuantity() <= 0) {
            throw new IllegalArgumentException("Fuel quantity must be greater than 0");
        }
        
        if (record.getCost() == null || record.getCost() < 0) {
            throw new IllegalArgumentException("Fuel cost cannot be negative");
        }
        
        if (record.getMileage() == null || record.getMileage() < 0) {
            throw new IllegalArgumentException("Mileage cannot be negative");
        }
        
        // Calculate price per liter if not provided
        if (record.getPricePerLiter() == null && record.getCost() != null && record.getQuantity() != null
                && record.getQuantity() > 0) {
            record.setPricePerLiter(record.getCost() / record.getQuantity());
        }
        
        FuelRecord saved = repository.save(record);
        log.info("Fuel record added successfully - ID: {}, Vehicle: {}, Quantity: {}L, Cost: Rs.{}", 
                saved.getId(), saved.getVehiclePlate(), saved.getQuantity(), saved.getCost());
        return saved;
>>>>>>> 0c49f51 (fixed user verification)
    }

    /**
     * Get fuel records for specific vehicle by plate number
     */
    public List<FuelRecord> getFuelRecordsByVehiclePlate(String vehiclePlate) {
        if (vehiclePlate == null || vehiclePlate.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle plate is required");
        }
        log.info("Fetching fuel records for vehicle plate: {}", vehiclePlate);
        return repository.findByVehiclePlate(vehiclePlate);
    }

    /**
     * Get fuel records for specific vehicle by plate number with pagination
     */
    public Page<FuelRecord> getFuelRecordsByVehicleWithPagination(String vehiclePlate, Pageable pageable) {
        if (vehiclePlate == null || vehiclePlate.trim().isEmpty()) {
            throw new IllegalArgumentException("Vehicle plate is required");
        }
        log.info("Fetching fuel records for vehicle plate: {} with pagination", vehiclePlate);
        return repository.findByVehiclePlate(vehiclePlate, pageable);
    }
}
