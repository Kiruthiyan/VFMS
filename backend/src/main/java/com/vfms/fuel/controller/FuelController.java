package com.vfms.fuel.controller;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.service.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
public class FuelController {
    private final FuelService service;

    @GetMapping
    public ResponseEntity<List<FuelRecord>> getAllFuelRecords() {
        return ResponseEntity.ok(service.getAllFuelRecords());
    }

    @PostMapping
    public ResponseEntity<FuelRecord> addFuelRecord(@RequestBody FuelRecord record) {
        return ResponseEntity.ok(service.addFuelRecord(record));
    }
    
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecord>> getByVehicle(@PathVariable Integer vehicleId) {
        return ResponseEntity.ok(service.getFuelRecordsByVehicle(vehicleId));
    }
}
