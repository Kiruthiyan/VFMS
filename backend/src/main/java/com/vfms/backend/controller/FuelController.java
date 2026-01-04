package com.vfms.backend.controller;

import com.vfms.backend.dto.FuelLogRequest;
import com.vfms.backend.dto.FuelLogResponse;
import com.vfms.backend.service.FuelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<FuelLogResponse> addFuelLog(
            @RequestParam("vehicleId") Long vehicleId,
            @RequestParam("fuelQuantity") Double fuelQuantity,
            @RequestParam("cost") Double cost,
            @RequestParam("date") String date,
            @RequestParam(value = "receipt", required = false) MultipartFile receipt) {
        
        FuelLogRequest request = new FuelLogRequest();
        request.setVehicleId(vehicleId);
        request.setFuelQuantity(fuelQuantity);
        request.setCost(cost);
        request.setDate(java.time.LocalDate.parse(date));

        FuelLogResponse response = fuelService.addFuelLog(request, receipt);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<FuelLogResponse>> getFuelHistory(
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) String month) {
        List<FuelLogResponse> history = fuelService.getFuelHistory(vehicleId, month);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFuelSummary() {
        Map<String, Object> summary = (Map<String, Object>) fuelService.getFuelSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getFuelAnalytics() {
        Map<String, Object> analytics = (Map<String, Object>) fuelService.getFuelAnalytics();
        return ResponseEntity.ok(analytics);
    }
}

