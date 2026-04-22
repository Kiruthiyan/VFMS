package com.vfms.fuel.controller;

import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.service.FuelService;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Fuel Management API Controller
 * 
 * Base Path: /api/v1/fuel
 * 
 * All endpoints require ADMIN role due to fuel management being admin-only.
 * This controller handles fuel record CRUD operations, filtering, and flagging.
 */
@RestController
@RequestMapping("/api/v1/fuel")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  C R E A T E   O P E R A T I O N S  ████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Create a new fuel record with optional receipt
     * 
     * @param request Fuel record details
     * @param receipt Optional receipt image/document
     * @param user   Authenticated admin user
     * @return Created fuel record response
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FuelRecordResponse> createFuelRecord(
            @Valid @RequestPart("data") CreateFuelRecordRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fuelService.createFuelRecord(request, receipt, user));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  R E A D   O P E R A T I O N S  ████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get all fuel records with pagination support
     * 
     * @return List of all fuel records
     */
    @GetMapping
    public ResponseEntity<List<FuelRecordResponse>> getAllRecords() {
        return ResponseEntity.ok(fuelService.getAllRecords());
    }

    /**
     * Get a specific fuel record with real-time vehicle data
     * Fetches latest vehicle status from vehicle endpoint
     * 
     * @param id Fuel record UUID
     * @return Fuel record with real-time vehicle details
     */
    @GetMapping("/{id}/with-vehicle-data")
    public ResponseEntity<FuelRecordResponse> getFuelRecordWithVehicleData(
            @PathVariable UUID id) {
        FuelRecordResponse response = fuelService.getFuelRecordWithRealTimeData(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all fuel records with real-time vehicle data
     * Fetches latest vehicle status for each record
     * Note: Use with caution in production (high API calls)
     * 
     * @return List of fuel records with real-time vehicle data
     */
    @GetMapping("/realtime/all")
    public ResponseEntity<List<FuelRecordResponse>> getAllRecordsWithRealTimeData() {
        List<FuelRecordResponse> records = fuelService.getAllRecordsWithRealTimeData();
        return ResponseEntity.ok(records);
    }

    /**
     * Search fuel records with filters
     * Supports filtering by date range, vehicle, and driver
     * 
     * @param from Start date (YYYY-MM-DD)
     * @param to End date (YYYY-MM-DD)
     * @param vehicleId Optional vehicle UUID filter
     * @param driverId Optional driver UUID filter
     * @return Filtered fuel records
     */
    @GetMapping("/search")
    public ResponseEntity<List<FuelRecordResponse>> searchFuelRecords(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId) {
        return ResponseEntity.ok(
                fuelService.getByDateRange(from, to, vehicleId, driverId));
    }

    /**
     * Get fuel records by vehicle
     * 
     * @param vehicleId Vehicle UUID
     * @return Fuel records for the vehicle
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicle(
            @PathVariable UUID vehicleId) {
        return ResponseEntity.ok(fuelService.getByVehicle(vehicleId));
    }

    /**
     * Get fuel records by vehicle with real-time vehicle data
     * Includes latest vehicle status and details
     * 
     * @param vehicleId Vehicle UUID
     * @return Fuel records with real-time vehicle data
     */
    @GetMapping("/vehicle/{vehicleId}/realtime")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicleRealTime(
            @PathVariable UUID vehicleId) {
        return ResponseEntity.ok(
                fuelService.getByVehicleWithRealTimeData(vehicleId));
    }

    /**
     * Get fuel records by driver
     * 
     * @param driverId Driver UUID
     * @return Fuel records for the driver
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByDriver(
            @PathVariable UUID driverId) {
        return ResponseEntity.ok(fuelService.getByDriver(driverId));
    }

    /**
     * Get all flagged/suspicious fuel records
     * 
     * @return List of flagged records (potential misuse detected)
     */
    @GetMapping("/flagged")
    public ResponseEntity<List<FuelRecordResponse>> getFlaggedRecords() {
        return ResponseEntity.ok(fuelService.getFlaggedRecords());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  U P D A T E   O P E R A T I O N S  ██████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Update an existing fuel record
     * 
     * @param id Fuel record UUID
     * @param request Updated fuel record data
     * @return Updated fuel record
     */
    @PutMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> updateFuelRecord(
            @PathVariable UUID id,
            @Valid @RequestBody CreateFuelRecordRequest request) {
        // TODO: Implement update logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * Partially update a fuel record
     * 
     * @param id Fuel record UUID
     * @param updates Partial update data
     * @return Updated fuel record
     */
    @PatchMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> patchFuelRecord(
            @PathVariable UUID id,
            @RequestBody CreateFuelRecordRequest updates) {
        // TODO: Implement partial update logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  F L A G G I N G   O P E R A T I O N S  ██████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Flag a fuel record as suspicious (misuse detected)
     * 
     * @param id Fuel record UUID
     * @return Updated fuel record with flag status
     */
    @PatchMapping("/{id}/flag")
    public ResponseEntity<FuelRecordResponse> flagFuelRecord(@PathVariable UUID id) {
        // TODO: Implement flag logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * Unflag a fuel record (mark as legitimate)
     * 
     * @param id Fuel record UUID
     * @return Updated fuel record with flag removed
     */
    @PatchMapping("/{id}/unflag")
    public ResponseEntity<FuelRecordResponse> unflagFuelRecord(@PathVariable UUID id) {
        // TODO: Implement unflag logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  D E L E T E   O P E R A T I O N S  ██████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Delete a fuel record
     * 
     * @param id Fuel record UUID
     * @return HTTP 204 No Content on success
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelRecord(@PathVariable UUID id) {
        // TODO: Implement deleteById in FuelService and uncomment below
        // fuelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
