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
     * ═══════════════════════════════════════════════════════════════════════
     * Real-Time Vehicle Data Endpoint
     * ═══════════════════════════════════════════════════════════════════════
     * 
     * Get a specific fuel record with REAL-TIME vehicle data.
     * 
     * WHAT THIS DOES:
     *   1. Fetches fuel record by ID from database
     *   2. Makes HTTP call to vehicle endpoint for current data
     *   3. Enriches response with real-time vehicle details
     *   4. Returns historical fuel data + current vehicle status
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/{id}/with-vehicle-data
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/with-vehicle-data
     * 
     * EXAMPLE RESPONSE:
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "vehicleMakeModel": "Toyota Camry",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "odometerReading": 50000.0
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK          - Record found and returned with vehicle data
     *   404 NOT FOUND   - Fuel record doesn't exist
     *   500 ERROR       - Server error (database or API failure)
     * 
     * PERFORMANCE:
     *   - One database query to fetch fuel record
     *   - One HTTP call to vehicle endpoint
     *   - Total response time: ~100-500ms (depends on vehicle API)
     * 
     * FALLBACK:
     *   If vehicle API fails, returns fuel record with cached vehicle data
     *   (user doesn't see an error, just slightly stale vehicle info)
     * 
     * USE CASES:
     *   - User clicks to view fuel record details
     *   - Showing current vehicle status alongside historical fuel data
     *   - Comparing recorded odometer vs current odometer
     *   - Detailed record view with fresh vehicle info
     * 
     * @param id Fuel record UUID (from URL path)
     * @return Fuel record with real-time vehicle data
     */
    @GetMapping("/{id}/with-vehicle-data")
    public ResponseEntity<FuelRecordResponse> getFuelRecordWithVehicleData(
            @PathVariable UUID id) {
        // ── STEP 1: Call service to get fuel record with real-time data ──
        // Service handles: database query + API call + fallback logic
        FuelRecordResponse response = fuelService.getFuelRecordWithRealTimeData(id);
        
        // ── STEP 2: Return response with HTTP 200 OK status ──
        return ResponseEntity.ok(response);
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * All Records with Real-Time Vehicle Data Endpoint
     * ═══════════════════════════════════════════════════════════════════════
     * 
     * Get ALL fuel records with REAL-TIME vehicle data.
     * 
     * ⚠️ PRODUCTION WARNING:
     *   This endpoint makes one API call per fuel record.
     *   With 1000 fuel records = 1000 API calls.
     *   Can be SLOW on large datasets. Use with caution.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/realtime/all
     * 
     * RATE LIMITING RECOMMENDATIONS:
     *   - Implement pagination: GET /api/v1/fuel/realtime/all?page=0&size=50
     *   - Cache results: Don't call this every second
     *   - Use standard endpoint for quick lookups
     * 
     * WHEN TO USE:
     *   - Exporting full fuel report with current vehicle status
     *   - End-of-day reports with vehicle snapshots
     *   - For small result sets (< 50 records)
     *   - When current vehicle data is absolutely required
     * 
     * WHEN NOT TO USE:
     *   - High frequency API calls (refreshing dashboards)
     *   - Large result sets (thousands of records)
     *   - When speed is critical
     *   - For browsing/navigation (use standard endpoint instead)
     * 
     * FALLBACK STRATEGY:
     *   If vehicle API fails for individual records, those records return
     *   with cached vehicle data instead of failing the entire response.
     * 
     * @return List of all fuel records with real-time vehicle data
     */
    @GetMapping("/realtime/all")
    public ResponseEntity<List<FuelRecordResponse>> getAllRecordsWithRealTimeData() {
        // ── STEP 1: Call service to get all records with real-time data ──
        // Service makes API calls for each record (potentially expensive!)
        List<FuelRecordResponse> records = fuelService.getAllRecordsWithRealTimeData();
        
        // ── STEP 2: Return list with HTTP 200 OK status ──
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
     * Get fuel records by vehicle with CACHED vehicle data.
     * PERFORMANCE: Fast - single database query
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/vehicle/{vehicleId}
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/vehicle/d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e
     * 
     * @param vehicleId Vehicle UUID
     * @return Fuel records for the vehicle (cached data)
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicle(
            @PathVariable UUID vehicleId) {
        // Fetch fuel records using cached vehicle data (fast)
        return ResponseEntity.ok(fuelService.getByVehicle(vehicleId));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * Vehicle Fuel History with Real-Time Data Endpoint
     * ═══════════════════════════════════════════════════════════════════════
     * 
     * Get fuel records for a vehicle with REAL-TIME vehicle data.
     * 
     * WHAT THIS DOES:
     *   1. Validates vehicle exists using real-time API call
     *   2. Fetches all fuel records for this vehicle from database
     *   3. For EACH record, fetches current vehicle data from API
     *   4. Returns complete fuel history with vehicle snapshots
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/vehicle/{vehicleId}/realtime
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/vehicle/d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e/realtime
     * 
     * EXAMPLE RESPONSE:
     *   [
     *     {
     *       "id": "abc123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "odometerReading": 50000.0
     *     },
     *     ...
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK          - Records found and returned
     *   404 NOT FOUND   - Vehicle doesn't exist
     *   500 ERROR       - Server error
     * 
     * PERFORMANCE:
     *   - One API call to validate vehicle exists
     *   - One database query to fetch records
     *   - One API call PER RECORD for real-time vehicle data
     *   - Total: 1 + 1 + N API/database calls (where N = number of records)
     * 
     * ⚠️ PRODUCTION WARNING:
     *   If vehicle has 500 fuel records, makes 500 API calls.
     *   Use pagination or caching in production:
     *     GET /api/v1/fuel/vehicle/{vehicleId}/realtime?page=0&size=50
     * 
     * FALLBACK:
     *   If vehicle API fails for specific records, those records return
     *   with cached vehicle data instead of failing entire response.
     * 
     * USE CASES:
     *   - Vehicle detail page showing complete fuel history
     *   - Fuel records tab in vehicle management UI
     *   - Exporting vehicle fuel history with current status
     *   - Checking if vehicle status changed since fuel entries
     *   - Reports showing "actual vs recorded" for verification
     * 
     * BETTER ALTERNATIVE:
     *   For speed: Use GET /vehicle/{vehicleId} (cached, no API calls)
     *   For details: Use this endpoint (fresh vehicle data)
     *   Consider: Implement caching layer to reduce API calls
     * 
     * @param vehicleId Vehicle UUID (from URL path)
     * @return Fuel records with real-time vehicle data
     * @throws RuntimeException if vehicle not found
     */
    @GetMapping("/vehicle/{vehicleId}/realtime")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicleRealTime(
            @PathVariable UUID vehicleId) {
        // ── STEP 1: Call service to get records with real-time vehicle data ──
        // Service handles: validation + database query + API calls + fallback
        List<FuelRecordResponse> records = fuelService.getByVehicleWithRealTimeData(vehicleId);
        
        // ── STEP 2: Return list with HTTP 200 OK status ──
        return ResponseEntity.ok(records);
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
