package com.vfms.controller;

import com.vfms.entity.FuelLog;
import com.vfms.service.FuelLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/fuel")
@CrossOrigin(origins = "http://localhost:3000")
public class FuelLogController {

    @Autowired
    private FuelLogService service;

    @GetMapping("/logs")
    public List<FuelLog> getLogs() {
        return service.getAllLogs();
    }

    @PostMapping("/logs")
    public ResponseEntity<FuelLog> createLog(@RequestBody FuelLog fuelLog) {
        return ResponseEntity.ok(service.createLog(fuelLog));
    }

    @PutMapping("/logs/{id}")
    public ResponseEntity<FuelLog> updateLog(@PathVariable Long id, @RequestBody FuelLog fuelLog) {
        return ResponseEntity.ok(service.updateLog(id, fuelLog));
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Long id) {
        service.deleteLog(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs/range")
    public ResponseEntity<List<FuelLog>> getByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(service.getLogsByDateRange(startDate, endDate));
    }

    @GetMapping("/total-spend")
    public Double getTotalSpend() {
        return service.getTotalSpend();
    }

    @GetMapping("/total-consumption")
    public Double getTotalConsumption() {
        return service.getTotalConsumption();
    }
}