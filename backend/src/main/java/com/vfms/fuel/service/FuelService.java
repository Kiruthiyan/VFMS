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
        return repository.save(record);
    }
    
    public List<FuelRecord> getFuelRecordsByVehicle(Integer vehicleId) {
        return repository.findByVehicleId(vehicleId);
    }
}
