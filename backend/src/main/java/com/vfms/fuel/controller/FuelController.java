package com.vfms.fuel.controller;

import com.vfms.auth.model.User;
import com.vfms.file.service.FileService;
import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.service.FuelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
@Slf4j
public class FuelController {
    private final FuelService service;
    private final FileService fileService;

    /**
     * Get all fuel records with pagination
     * Query params: page=0&size=20&sort=date,desc
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<FuelRecord>> getAllFuelRecords(Pageable pageable) {
        log.info("Fetching all fuel records with pagination");
        return ResponseEntity.ok(service.getAllFuelRecordsWithPagination(pageable));
    }

    /**
     * Get a specific fuel record by ID
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> getFuelRecordById(@PathVariable Integer id) {
        log.info("Fetching fuel record with ID: {}", id);
        try {
            return service.getFuelRecordById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Add new fuel record
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> addFuelRecord(@RequestBody FuelRecord record,
                                           @AuthenticationPrincipal User currentUser) {
        try {
            // Always use the authenticated user's ID — never trust client-supplied driverId
            record.setDriverId(currentUser.getId());
            log.info("Adding fuel record - Vehicle Plate: {}, Driver ID: {}, Quantity: {}, Cost: {}",
                    record.getVehiclePlate(), record.getDriverId(), record.getQuantity(), record.getCost());

            FuelRecord saved = service.addFuelRecord(record);
            log.info("Fuel record saved successfully with ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("ERROR saving fuel record: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to save fuel record: " + e.getMessage()));
        }
    }

    /**
     * Get fuel records for a specific vehicle by plate number with pagination
     * Query params: page=0&size=20&sort=date,desc
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping("/vehicle/{vehiclePlate}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> getByVehicleWithPagination(@PathVariable String vehiclePlate, Pageable pageable) {
        log.info("Fetching fuel records for vehicle plate: {} with pagination", vehiclePlate);
        try {
            return ResponseEntity.ok(service.getFuelRecordsByVehicleWithPagination(vehiclePlate, pageable));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Upload fuel receipt/document
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @PostMapping("/upload-receipt")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadReceipt(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Uploading fuel receipt file: {}", file.getOriginalFilename());
        
        String receiptPath = fileService.uploadReceipt(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("receiptPath", receiptPath);
        response.put("message", "Receipt uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
}
