package com.vfms.fuel.service;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.repository.FuelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuelService {
    private final FuelRepository repository;

    public List<FuelRecord> getAllFuelRecords() {
        return repository.findAll();
    }

    public FuelRecord addFuelRecord(FuelRecord record) {
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
    }

    public List<FuelRecord> getFuelRecordsByVehicle(Integer vehicleId) {
        return repository.findByVehicleId(vehicleId);
    }
}
