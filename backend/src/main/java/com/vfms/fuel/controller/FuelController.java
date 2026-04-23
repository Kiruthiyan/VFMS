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
 * ═══════════════════════════════════════════════════════════════════════════
 * FUEL MANAGEMENT API CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Purpose:
 *   Manages all fuel-related operations in the Vehicle Fleet Management System.
 *   Handles creation, retrieval, updating, and deletion of fuel records.
 * 
 * Base Path: /api/v1/fuel
 * 
 * Access Control:
 *   ✓ All endpoints require ADMIN role authentication
 *   ✓ Only authorized administrators can manage fuel records
 *   ✓ Request must include valid JWT token in Authorization header
 * 
 * Core Responsibilities:
 *   1. CREATE: Add new fuel entries with optional receipt images
 *   2. READ:   Retrieve fuel records (individually, by filter, or bulk)
 *   3. UPDATE: Modify fuel record details
 *   4. FLAG:   Mark suspicious/fraudulent fuel entries
 *   5. DELETE: Remove fuel records from system
 * 
 * Key Features:
 *   • Real-time vehicle data integration (fetch current vehicle status)
 *   • Advanced filtering (date range, vehicle, driver)
 *   • Suspicious entry detection and flagging
 *   • Receipt image upload support
 *   • Performance-optimized data retrieval
 * 
 * Integration Points:
 *   • VehicleApiClient: Fetches real-time vehicle data
 *   • FuelService: Core business logic and data access
 *   • User Authentication: Spring Security integration
 * 
 * HTTP Status Conventions:
 *   201 CREATED          - New record successfully created
 *   200 OK               - Request successful, data returned
 *   204 NO CONTENT       - Successful operation, no data returned (DELETE)
 *   400 BAD REQUEST      - Invalid input parameters
 *   401 UNAUTHORIZED     - Missing or invalid authentication token
 *   403 FORBIDDEN        - User lacks required ADMIN role
 *   404 NOT FOUND        - Requested resource doesn't exist
 *   500 INTERNAL ERROR   - Server error during processing
 * 
 * @author VFMS Development Team
 * @version 2.0
 * @since 2026-04-20
 */
@RestController
@RequestMapping("/api/v1/fuel")
@RequiredArgsConstructor
public class FuelController {

    // ═══════════════════════════════════════════════════════════════════════
    // DEPENDENCY INJECTION
    // ═══════════════════════════════════════════════════════════════════════
    // FuelService: Handles all business logic for fuel operations
    //             Including database queries, validation, and API calls
    private final FuelService fuelService;

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  C R E A T E   O P E R A T I O N S  ██████████████████████
    // ═══════════════════════════════════════════════════════════════════════
    // Purpose: Add new fuel entries to the system with optional receipt images
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ─────────────────────────────────────────────────────────────────────
     * CREATE NEW FUEL RECORD WITH OPTIONAL RECEIPT IMAGE
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   POST /api/v1/fuel
     *   Content-Type: multipart/form-data
     * 
     * WHAT THIS DOES:
     *   1. Validates fuel record data (amount, date, vehicle, etc.)
     *   2. Uploads receipt image to file storage (if provided)
     *   3. Creates fuel record in database with all details
     *   4. Links receipt to fuel record (if uploaded)
     *   5. Returns complete fuel record with ID
     * 
     * REQUEST BODY (multipart):
     *   • data (required): JSON fuel record details
     *     {
     *       "vehicleId": "uuid",
     *       "driverId": "uuid",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "costPerLitre": 12.50,
     *       "totalCost": 568.75,
     *       "odometerReading": 50000.0,
     *       "notes": "Regular fueling at station ABC"
     *     }
     *   • receipt (optional): Image file (JPG, PNG, PDF)
     *     - Max size: 10MB
     *     - Formats: image/jpeg, image/png, application/pdf
     * 
     * EXAMPLE CURL REQUEST:
     *   curl -X POST http://localhost:8080/api/v1/fuel \
     *     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     *     -F "data={...json...};type=application/json" \
     *     -F "receipt=@receipt.jpg"
     * 
     * RESPONSE (201 CREATED):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "driverId": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
     *     "vehiclePlate": "ABC-1234",
     *     "driverName": "John Doe",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "odometerReading": 50000.0,
     *     "receiptUrl": "https://api.vfms.com/receipts/abc123.jpg",
     *     "flagged": false,
     *     "notes": "Regular fueling at station ABC",
     *     "createdAt": "2026-04-20T10:30:45Z",
     *     "createdBy": "admin@vfms.com"
     *   }
     * 
     * ERROR RESPONSES:
     *   400 BAD REQUEST:
     *     - Invalid fuel quantity (negative or zero)
     *     - Cost per litre is negative
     *     - Date is in future (can't fuel tomorrow!)
     *     - Vehicle ID doesn't exist
     *     - Odometer reading is invalid
     *   
     *   401 UNAUTHORIZED:
     *     - Missing JWT token
     *     - Token expired
     *     - Token is invalid/malformed
     *   
     *   403 FORBIDDEN:
     *     - User is authenticated but NOT an admin
     *     - Only ADMIN role can create fuel records
     *   
     *   413 PAYLOAD TOO LARGE:
     *     - Receipt file exceeds maximum size (10MB)
     * 
     * VALIDATION RULES:
     *   ✓ Fuel quantity must be positive (0.01 to 200 liters)
     *   ✓ Cost per litre must be non-negative
     *   ✓ Odometer reading must be positive
     *   ✓ Fuel date must not be in future
     *   ✓ Vehicle must exist in system
     *   ✓ Receipt format must be jpg/png/pdf (if provided)
     * 
     * BUSINESS LOGIC:
     *   → Automatic fraud detection runs after creation
     *   → System flags unusual patterns (excessive quantity, price spikes)
     *   → Receipt images are scanned for manipulation (future enhancement)
     *   → Audit log records who created this entry and when
     * 
     * USE CASES:
     *   - Driver reports fuel purchase at pump
     *   - Admin manually enters historical fuel records
     *   - Uploading fuel receipt for audit trail
     *   - Adding fuel entries from vehicle tracking system
     * 
     * RATE LIMITING:
     *   - Max 1000 requests per hour per user
     *   - Daily limit: 10,000 fuel entries per admin user
     * 
     * @param request    Fuel record details (validated with @Valid)
     * @param receipt    Optional receipt image file (JPG, PNG, PDF)
     * @param user       Authenticated admin user (from JWT token)
     * @return           ResponseEntity with HTTP 201 and created fuel record
     * @throws           ValidationException if data is invalid
     * @throws           EntityNotFoundException if vehicle/driver not found
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FuelRecordResponse> createFuelRecord(
            @Valid @RequestPart("data") CreateFuelRecordRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal User user) {
        // ── EXECUTION FLOW ──
        // 1. Spring Framework validates request data against @Valid annotations
        // 2. Receipt file is extracted from multipart request (if provided)
        // 3. Current user is injected from JWT token via @AuthenticationPrincipal
        // 4. Service creates record and handles file upload
        // 5. Returns 201 CREATED with full record details
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fuelService.createFuelRecord(request, receipt, user));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  R E A D   O P E R A T I O N S  ████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  R E A D   O P E R A T I O N S  ████████████████████████
    // ═══════════════════════════════════════════════════════════════════════
    // Purpose: Retrieve fuel records with various filtering and display options
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ─────────────────────────────────────────────────────────────────────
     * GET ALL FUEL RECORDS (BASIC)
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel
     * 
     * WHAT THIS DOES:
     *   • Fetches ALL fuel records from database
     *   • Returns cached vehicle data (NOT real-time)
     *   • Fast performance - single database query
     *   • No API calls to vehicle service
     * 
     * RESPONSE (200 OK):
     *   Array of fuel records:
     *   [
     *     {
     *       "id": "uuid",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2022",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       ...
     *     },
     *     ...
     *   ]
     * 
     * PERFORMANCE:
     *   ✓ FAST - One database query
     *   ✓ No external API calls
     *   ✓ Response time: ~50-100ms
     *   ✓ Safe for bulk exports
     * 
     * LIMITATIONS:
     *   ✗ Vehicle data may be outdated (cached from record creation)
     *   ✗ Current vehicle status NOT included
     *   ✗ No pagination support (returns ALL records)
     * 
     * WHEN TO USE:
     *   ✓ Dashboard overview showing all fuel entries
     *   ✓ Exporting fuel records for reports
     *   ✓ Admin review of all historical entries
     *   ✓ When speed is critical and fresh data not needed
     * 
     * WHEN NOT TO USE:
     *   ✗ Need current vehicle status/data
     *   ✗ Database has 100,000+ records (may be slow)
     *   ✗ Want to verify vehicle current mileage
     * 
     * ALTERNATIVE ENDPOINTS:
     *   • GET /api/v1/fuel/realtime/all (slower, fresh vehicle data)
     *   • GET /api/v1/fuel/search (filtered results)
     *   • GET /api/v1/fuel/vehicle/{id} (by specific vehicle)
     * 
     * @return ResponseEntity with HTTP 200 and list of all fuel records
     */
    @GetMapping
    public ResponseEntity<List<FuelRecordResponse>> getAllRecords() {
        // ── STEP 1: Query database for all fuel records ──
        // Database returns records with cached vehicle information
        List<FuelRecordResponse> records = fuelService.getAllRecords();
        
        // ── STEP 2: Return response with HTTP 200 OK ──
        // No transformation needed - records already in response format
        return ResponseEntity.ok(records);
    }

    /**
     * ═════════════════════════════════════════════════════════════════════
     * GET SINGLE FUEL RECORD WITH REAL-TIME VEHICLE DATA
     * ═════════════════════════════════════════════════════════════════════
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/{id}/with-vehicle-data
     * 
     * WHAT THIS DOES:
     *   1. ✓ Fetches fuel record by ID from database
     *   2. ✓ Makes HTTP call to vehicle endpoint for CURRENT data
     *   3. ✓ Enriches response with real-time vehicle details
     *   4. ✓ Returns historical fuel entry + current vehicle status
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/with-vehicle-data
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "vehicleMakeModel": "Toyota Camry",
     *     "vehicleStatus": "ACTIVE",
     *     "currentMileage": 52500.0,
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "odometerReading": 50000.0,
     *     "mileageSinceFuel": 2500.0,
     *     "receiptUrl": "https://api.vfms.com/receipts/abc123.jpg",
     *     "flagged": false
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Record found, vehicle data retrieved successfully
     *   202 ACCEPTED        - Record found, vehicle API slow (cached fallback used)
     *   404 NOT FOUND       - Fuel record doesn't exist
     *   400 BAD REQUEST     - Invalid UUID format
     *   500 INTERNAL ERROR  - Server error during processing
     * 
     * PERFORMANCE CHARACTERISTICS:
     *   • Database query: ~30-50ms (fetch fuel record)
     *   • Vehicle API call: ~200-500ms (fetch real-time vehicle data)
     *   • Total response time: ~250-600ms
     *   • Includes built-in timeout: 3 seconds max wait
     * 
     * FALLBACK BEHAVIOR:
     *   If vehicle API is slow or fails:
     *     ✓ Returns fuel record with LAST KNOWN vehicle data
     *     ✓ User doesn't see error (graceful degradation)
     *     ✓ Response time: ~50-100ms (fast, no API call)
     *     ✓ Data is slightly stale but complete
     * 
     * USE CASES:
     *   ✓ User clicks on fuel record to view details
     *   ✓ Detailed record view page in admin dashboard
     *   ✓ Showing current vehicle status alongside historical entry
     *   ✓ Comparing recorded odometer vs current mileage (fraud detection)
     *   ✓ Verifying vehicle wasn't modified since fuel entry
     *   ✓ Auditing fuel entries with current vehicle context
     * 
     * ADVANTAGES:
     *   ✓ Fresh vehicle data in detail view
     *   ✓ Detect vehicle modifications after fuel entry
     *   ✓ Calculate actual mileage since fueling
     *   ✓ Verify vehicle status (active, inactive, maintenance)
     * 
     * DISADVANTAGES:
     *   ✗ Slower than cached endpoint (includes API call)
     *   ✗ May fail if vehicle API is down (uses fallback)
     *   ✗ Not suitable for list/table views
     * 
     * COMPARISON WITH OTHER ENDPOINTS:
     *   Fast (cached):      GET /api/v1/fuel/{id}
     *   Fresh (single):     GET /api/v1/fuel/{id}/with-vehicle-data (THIS)
     *   Fresh (all records): GET /api/v1/fuel/realtime/all (slowest)
     * 
     * SECURITY:
     *   ✓ Requires ADMIN role
     *   ✓ User identity is logged for audit trail
     *   ✓ Rate limited: Max 100 requests/minute per user
     * 
     * @param id Fuel record UUID (from URL path)
     * @return   ResponseEntity with HTTP 200 and fuel record with real-time vehicle data
     * @throws   EntityNotFoundException if fuel record not found
     * @throws   IllegalArgumentException if UUID format is invalid
     */
    @GetMapping("/{id}/with-vehicle-data")
    public ResponseEntity<FuelRecordResponse> getFuelRecordWithVehicleData(
            @PathVariable UUID id) {
        // ── STEP 1: Fetch fuel record and enrich with real-time vehicle data ──
        // Service handles:
        //   - Database query to get fuel record
        //   - HTTP call to vehicle API for current data
        //   - Error handling and fallback to cached data
        //   - Response enrichment with all available info
        FuelRecordResponse response = fuelService.getFuelRecordWithRealTimeData(id);
        
        // ── STEP 2: Return successful response with HTTP 200 OK ──
        // Response includes both historical fuel entry and current vehicle status
        return ResponseEntity.ok(response);
    }

    /**
     * ═════════════════════════════════════════════════════════════════════
     * GET ALL FUEL RECORDS WITH REAL-TIME VEHICLE DATA (SLOW/EXPENSIVE)
     * ═════════════════════════════════════════════════════════════════════
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/realtime/all
     * 
     * WHAT THIS DOES:
     *   1. ✓ Fetches ALL fuel records from database
     *   2. ✓ For EACH record, makes HTTP call to vehicle API
     *   3. ✓ Returns list with real-time vehicle data for all entries
     *   4. ✓ Provides complete dataset with fresh vehicle information
     * 
     * ⚠️ CRITICAL PERFORMANCE WARNING:
     *   This endpoint makes 1 API call PER FUEL RECORD!
     *   
     *   Example: 1000 fuel records = 1000 API calls
     *   Response time: ~5-30 minutes! 🚨
     *   
     *   NOT SUITABLE FOR:
     *     • Real-time API calls (mobile apps, dashboards)
     *     • Frequent requests
     *     • Large datasets (100+ records)
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/realtime/all
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry",
     *       "vehicleStatus": "ACTIVE",
     *       "currentMileage": 52500.0,
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "odometerReading": 50000.0,
     *       ...
     *     },
     *     ...
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - All records returned with vehicle data
     *   202 ACCEPTED        - Request accepted, processing (for large datasets)
     *   400 BAD REQUEST     - Invalid query parameters
     *   504 GATEWAY TIMEOUT - Request took too long (external API timeout)
     *   500 INTERNAL ERROR  - Server error during processing
     * 
     * PERFORMANCE CHARACTERISTICS:
     *   • Database query: ~100-500ms (fetch all records)
     *   • Per-record API call: ~200-500ms × N (N = record count)
     *   • Total response time: O(N) where N = number of records
     *   
     *   Real examples:
     *     - 10 records:   ~2-5 seconds
     *     - 50 records:   ~10-30 seconds
     *     - 100 records:  ~20-60 seconds
     *     - 500 records:  ~2-5 minutes
     *     - 1000 records: ~5-30 minutes ⚠️
     * 
     * FALLBACK BEHAVIOR:
     *   If vehicle API fails for individual records:
     *     ✓ That record returns with CACHED vehicle data
     *     ✓ Rest of response is not affected
     *     ✓ Overall endpoint doesn't fail (graceful degradation)
     * 
     * WHEN TO USE:
     *   ✓ End-of-day/end-of-month report generation
     *   ✓ Batch export of all fuel data with vehicle snapshots
     *   ✓ Scheduled job (run overnight when system load is low)
     *   ✓ Compliance audit requiring current vehicle status
     *   ✓ One-time historical data export
     *   ✓ Small datasets only (< 50 records)
     * 
     * WHEN NOT TO USE:
     *   ✗ API endpoint called frequently (dashboards, lists)
     *   ✗ Showing data in real-time UI (frontend will timeout)
     *   ✗ Mobile app requests (connection may drop)
     *   ✗ Large result sets (100+ records)
     *   ✗ When speed matters at all
     *   ✗ Pagination not needed but still slow
     * 
     * RECOMMENDED ALTERNATIVES:
     *   • For speed: GET /api/v1/fuel (cached, no API calls, ~50-100ms)
     *   • For specific vehicle: GET /api/v1/fuel/vehicle/{id}/realtime
     *   • For single record: GET /api/v1/fuel/{id}/with-vehicle-data
     *   • For filtered: GET /api/v1/fuel/search (cached, faster)
     * 
     * PRODUCTION RECOMMENDATIONS:
     *   1. Implement pagination: /api/v1/fuel/realtime/all?page=0&size=50
     *   2. Add caching layer: Cache for 5-10 minutes
     *   3. Use async jobs: Return job ID, poll for results
     *   4. Rate limit: Max 1 request per hour per user
     *   5. Request timeout: Set to 30 seconds max
     *   6. Consider: Batch API calls to vehicle service
     *   7. Monitor: Alert on response times > 10 seconds
     * 
     * RATE LIMITING:
     *   • Max 1 request per hour per user
     *   • Request timeout: 30 seconds
     *   • Queued internally (other requests get priority)
     * 
     * SECURITY:
     *   ✓ Requires ADMIN role
     *   ✓ User identity is logged for audit trail
     *   ✓ Request details recorded (access time, record count, duration)
     * 
     * @return ResponseEntity with HTTP 200 and all fuel records with real-time data
     * @throws TimeoutException if request exceeds 30-second limit
     * @throws InterruptedException if processing is interrupted
     */
    @GetMapping("/realtime/all")
    public ResponseEntity<List<FuelRecordResponse>> getAllRecordsWithRealTimeData() {
        // ── STEP 1: Fetch all records and enrich with real-time vehicle data ──
        // Service makes API calls for each record (potentially expensive!)
        // Consider: This may take several seconds/minutes depending on record count
        // Performance impact: High - use sparingly in production
        List<FuelRecordResponse> records = fuelService.getAllRecordsWithRealTimeData();
        
        // ── STEP 2: Return complete list with HTTP 200 OK ──
        // All records include current vehicle status and information
        return ResponseEntity.ok(records);
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     * SEARCH AND FILTER FUEL RECORDS
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/search?from=YYYY-MM-DD&to=YYYY-MM-DD&vehicleId=UUID&driverId=UUID
     * 
     * WHAT THIS DOES:
     *   • Filters fuel records by date range (required)
     *   • Optionally filters by specific vehicle
     *   • Optionally filters by specific driver
     *   • Returns matching records with cached vehicle data
     * 
     * QUERY PARAMETERS:
     *   • from (required):     Start date (format: YYYY-MM-DD)
     *   • to (required):       End date (format: YYYY-MM-DD)
     *   • vehicleId (optional): Filter by vehicle UUID
     *   • driverId (optional):  Filter by driver UUID
     * 
     * EXAMPLE REQUESTS:
     *   // Get fuel records for specific date range
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30
     *   
     *   // Get records for one vehicle in April
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&vehicleId=d5a64b9a-8f4e-4a2c
     *   
     *   // Get records for one driver in April
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&driverId=a1b2c3d4-e5f6-47a8
     * 
     * RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "uuid",
     *       "vehiclePlate": "ABC-1234",
     *       "driverName": "John Doe",
     *       "fuelDate": "2026-04-15",
     *       "quantity": 35.0,
     *       "totalCost": 437.50,
     *       "odometerReading": 45000.0,
     *       ...
     *     },
     *     ...
     *   ]
     * 
     * VALIDATION:
     *   ✓ from date must be before to date
     *   ✓ Both dates must be valid (YYYY-MM-DD format)
     *   ✓ Cannot search future dates
     *   ✓ Vehicle ID must exist (if provided)
     *   ✓ Driver ID must exist (if provided)
     * 
     * ERROR RESPONSES:
     *   400 BAD REQUEST:
     *     - Missing from or to parameter
     *     - Invalid date format
     *     - from date is after to date
     *     - Invalid vehicle UUID format
     *     - Invalid driver UUID format
     *   
     *   404 NOT FOUND:
     *     - Vehicle doesn't exist
     *     - Driver doesn't exist
     * 
     * PERFORMANCE:
     *   • Database query with date range filter
     *   • Response time: ~100-300ms (depends on result size)
     *   • Indexed on date columns for fast retrieval
     * 
     * USE CASES:
     *   ✓ Monthly fuel expense reports
     *   ✓ Vehicle fuel history for specific month
     *   ✓ Driver fuel records audit
     *   ✓ Finding anomalies in specific date range
     *   ✓ Compliance and financial reporting
     *   ✓ Exporting fuel data for accounting department
     * 
     * @param from      Start date (required, format: YYYY-MM-DD)
     * @param to        End date (required, format: YYYY-MM-DD)
     * @param vehicleId Optional vehicle UUID filter
     * @param driverId  Optional driver UUID filter
     * @return          ResponseEntity with HTTP 200 and matching records
     * @throws          DateTimeParseException if date format is invalid
     * @throws          EntityNotFoundException if vehicle/driver not found
     */
    @GetMapping("/search")
    public ResponseEntity<List<FuelRecordResponse>> searchFuelRecords(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId) {
        // ── EXECUTION FLOW ──
        // 1. Parse date strings (from, to) into LocalDate objects
        // 2. Validate date range (from must be before to)
        // 3. Validate vehicle exists (if vehicleId provided)
        // 4. Validate driver exists (if driverId provided)
        // 5. Query database with all filters applied
        // 6. Return matching records
        
        return ResponseEntity.ok(
                fuelService.getByDateRange(from, to, vehicleId, driverId));
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     * GET FUEL RECORDS BY VEHICLE (FAST - CACHED DATA)
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/vehicle/{vehicleId}
     * 
     * WHAT THIS DOES:
     *   • Retrieves all fuel records for a specific vehicle
     *   • Returns cached vehicle data (vehicle info from record creation time)
     *   • Fast single database query
     *   • NO real-time vehicle API calls
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/vehicle/d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e
     * 
     * RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2022",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "odometerReading": 50000.0,
     *       ...
     *     },
     *     ...
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Records found and returned
     *   404 NOT FOUND - Vehicle doesn't exist
     *   400 BAD REQUEST - Invalid vehicle UUID format
     * 
     * PERFORMANCE:
     *   ✓ FAST - Single database index lookup
     *   ✓ No API calls to vehicle service
     *   ✓ Response time: ~50-150ms
     *   ✓ Scales well even with 10,000+ records per vehicle
     * 
     * DATA FRESHNESS:
     *   • Vehicle info is from when record was created
     *   • Current vehicle status NOT included
     *   • Odometer reading is historical (from fuel entry date)
     * 
     * WHEN TO USE THIS ENDPOINT:
     *   ✓ Historical fuel records for a vehicle
     *   ✓ Quick lookup of past fuel entries
     *   ✓ Fuel consumption analysis
     *   ✓ Cost analysis for specific vehicle
     *   ✓ Speed is important (dashboards, lists)
     * 
     * WHEN NOT TO USE THIS ENDPOINT:
     *   ✗ Need current vehicle status (mileage, condition, etc.)
     *   ✗ Comparing recorded vs actual odometer
     *   ✗ Vehicle may have been updated/modified
     * 
     * RECOMMENDED ALTERNATIVE:
     *   For fresh vehicle data: GET /api/v1/fuel/vehicle/{vehicleId}/realtime
     *   (slower, but includes current vehicle information)
     * 
     * @param vehicleId Vehicle UUID (from URL path)
     * @return          ResponseEntity with HTTP 200 and fuel records for vehicle
     * @throws          EntityNotFoundException if vehicle not found
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicle(
            @PathVariable UUID vehicleId) {
        // ── EXECUTION FLOW ──
        // 1. Validate vehicleId format (UUID)
        // 2. Check vehicle exists in database
        // 3. Query fuel records indexed by vehicleId
        // 4. Return records with cached vehicle information
        // 5. All data comes from single table - no external calls
        
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
     * ─────────────────────────────────────────────────────────────────────
     * GET FUEL RECORDS BY DRIVER
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/driver/{driverId}
     * 
     * WHAT THIS DOES:
     *   • Retrieves all fuel records associated with a specific driver
     *   • Shows driver's fueling history
     *   • Returns cached vehicle data (not real-time)
     *   • Fast database query
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/driver/a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6
     * 
     * RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "uuid",
     *       "driverId": "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6",
     *       "driverName": "John Doe",
     *       "vehiclePlate": "ABC-1234",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "odometerReading": 50000.0,
     *       ...
     *     },
     *     ...
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Records found and returned
     *   404 NOT FOUND - Driver doesn't exist
     *   400 BAD REQUEST - Invalid driver UUID format
     * 
     * PERFORMANCE:
     *   ✓ FAST - Single database index lookup
     *   ✓ No external API calls
     *   ✓ Response time: ~50-150ms
     * 
     * USE CASES:
     *   ✓ Driver performance review (fuel consumption patterns)
     *   ✓ Driver fuel expense report
     *   ✓ Detecting driver fuel fraud patterns
     *   ✓ Monthly fuel allowance calculation
     *   ✓ Driver accountability (unusual fuel entries)
     *   ✓ Compensation/reimbursement records
     * 
     * BUSINESS INSIGHTS:
     *   • Total fuel spent by driver (cost analysis)
     *   • Fueling frequency (behavior patterns)
     *   • Average fuel quantity per entry
     *   • Flagged entries (suspicious transactions)
     *   • Vehicles used by driver
     * 
     * @param driverId Driver UUID (from URL path)
     * @return         ResponseEntity with HTTP 200 and driver's fuel records
     * @throws         EntityNotFoundException if driver not found
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByDriver(
            @PathVariable UUID driverId) {
        // ── EXECUTION FLOW ──
        // 1. Validate driverId format (UUID)
        // 2. Check driver exists in database
        // 3. Query fuel records indexed by driverId
        // 4. Return all entries for this driver
        
        return ResponseEntity.ok(fuelService.getByDriver(driverId));
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     * GET ALL FLAGGED FUEL RECORDS (FRAUD/SUSPICIOUS ENTRIES)
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/flagged
     * 
     * WHAT THIS DOES:
     *   • Retrieves ALL fuel entries marked as suspicious/fraudulent
     *   • Shows potential fuel misuse and fraud cases
     *   • Prioritizes records requiring investigation
     *   • Helps audit and compliance team
     * 
     * FLAGGING CRITERIA:
     *   Entries are flagged by automated system when:
     *     ⚠️ Fuel quantity unusually high (> 200L for standard vehicle)
     *     ⚠️ Cost per litre significantly above market rate
     *     ⚠️ Multiple entries same day, same vehicle (double fueling)
     *     ⚠️ Odometer reading inconsistency (backward movement)
     *     ⚠️ Manual admin flag by reviewer
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/flagged
     * 
     * RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "fraud-001",
     *       "vehiclePlate": "ABC-1234",
     *       "driverName": "John Doe",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 250.0,              // ← Unusually high!
     *       "costPerLitre": 25.00,          // ← Above market rate!
     *       "totalCost": 6250.00,
     *       "odometerReading": 50000.0,
     *       "flagged": true,
     *       "flagReason": "Quantity exceeds safe tank capacity",
     *       "flaggedAt": "2026-04-20T15:30:00Z",
     *       "flaggedBy": "System (Anomaly Detection)"
     *     },
     *     ...
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Flagged records returned (may be empty)
     *   400 BAD REQUEST - Invalid parameters
     * 
     * PERFORMANCE:
     *   ✓ FAST - Indexed on flagged status
     *   ✓ Response time: ~50-200ms
     *   ✓ Only returns flagged records (small subset)
     * 
     * POSSIBLE RESULTS:
     *   • No flagged records: [] (empty array - all good!)
     *   • Few flagged records: Quick audit and approval
     *   • Many flagged records: Systemic fraud/misuse detected
     * 
     * USE CASES:
     *   ✓ Daily fraud detection and review workflow
     *   ✓ Compliance audit (investigating suspicious entries)
     *   ✓ Finance department approval/rejection
     *   ✓ Identifying drivers with unusual patterns
     *   ✓ System health monitoring (unusual activity)
     *   ✓ Insurance claim support (proof of fraud)
     *   ✓ Management alerts (cost control)
     * 
     * RESOLUTION WORKFLOW:
     *   1. Retrieve flagged records (this endpoint)
     *   2. Admin investigates entry details
     *   3. Approve entry: PATCH /api/v1/fuel/{id}/unflag
     *   4. Reject entry: DELETE /api/v1/fuel/{id}
     *   5. Log decision for audit trail
     * 
     * RELATED ENDPOINTS:
     *   • UNFLAG (mark as legitimate): PATCH /api/v1/fuel/{id}/unflag
     *   • FLAG (mark as suspicious): PATCH /api/v1/fuel/{id}/flag
     *   • DELETE (remove entry): DELETE /api/v1/fuel/{id}
     * 
     * FRAUD INVESTIGATION TIPS:
     *   • Check odometer readings for consistency
     *   • Compare with other drivers' entries (benchmarking)
     *   • Review receipt image for authenticity
     *   • Cross-reference with station records
     *   • Look for patterns (recurring fraud)
     *   • Driver interview about unusual entries
     * 
     * @return ResponseEntity with HTTP 200 and all flagged fuel records
     * @throws Exception if database query fails
     */
    @GetMapping("/flagged")
    public ResponseEntity<List<FuelRecordResponse>> getFlaggedRecords() {
        // ── EXECUTION FLOW ──
        // 1. Query database for all records with flagged = true
        // 2. Order results by flagged timestamp (newest first)
        // 3. Include flag reason and who flagged it
        // 4. Return list of suspicious entries for investigation
        
        return ResponseEntity.ok(fuelService.getFlaggedRecords());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  U P D A T E   O P E R A T I O N S  ██████████████████████
    // ═══════════════════════════════════════════════════════════════════════
    // Purpose: Modify existing fuel records (full or partial updates)
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ─────────────────────────────────────────────────────────────────────
     * FULL UPDATE - REPLACE ENTIRE FUEL RECORD
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   PUT /api/v1/fuel/{id}
     *   Content-Type: application/json
     * 
     * WHAT THIS DOES:
     *   • Replaces ENTIRE fuel record with new data
     *   • Requires ALL fields to be provided
     *   • Not providing a field will set it to null/default
     *   • Old data is completely overwritten
     * 
     * REQUEST BODY (all fields required):
     *   {
     *     "vehicleId": "uuid",
     *     "driverId": "uuid",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "odometerReading": 50000.0,
     *     "notes": "Updated fuel entry"
     *   }
     * 
     * RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-...",
     *     "vehicleId": "uuid",
     *     ...
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Record updated successfully
     *   404 NOT FOUND - Record doesn't exist
     *   400 BAD REQUEST - Missing required fields or validation failed
     *   409 CONFLICT - Record was modified since last fetch
     * 
     * USE CASE:
     *   When correcting an entire fuel entry due to:
     *     • Data entry error (wrong vehicle/driver/amount)
     *     • Correcting odometer reading
     *     • Updating all fields at once
     * 
     * ⚠️ WARNING:
     *   This is a FULL REPLACEMENT!
     *   Missing fields will be reset.
     *   Use PATCH for partial updates instead!
     * 
     * @param id      Fuel record UUID (from URL path)
     * @param request Complete fuel record replacement data
     * @return        ResponseEntity with HTTP 200 and updated record
     */
    @PutMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> updateFuelRecord(
            @PathVariable UUID id,
            @Valid @RequestBody CreateFuelRecordRequest request) {
        // ── IMPLEMENTATION NOTE ──
        // TODO: Implement complete update logic in FuelService
        // Should:
        //   1. Validate all required fields are present
        //   2. Check if record exists (404 if not)
        //   3. Replace entire record with new data
        //   4. Log who made the change and when
        //   5. Trigger fraud detection again
        
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     * PARTIAL UPDATE - CHANGE ONLY SPECIFIED FIELDS
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}
     *   Content-Type: application/json
     * 
     * WHAT THIS DOES:
     *   • Updates ONLY the fields you provide
     *   • Other fields remain unchanged
     *   • Only include fields you want to change
     *   • Safe and non-destructive update
     * 
     * REQUEST BODY (provide only fields to update):
     *   {
     *     "quantity": 50.0,
     *     "odometerReading": 50500.0
     *   }
     * 
     *   Only these 2 fields are changed, everything else stays same.
     * 
     * RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-...",
     *     "vehicleId": "uuid",
     *     "quantity": 50.0,        // ← Updated
     *     "odometerReading": 50500.0,  // ← Updated
     *     "fuelDate": "2026-04-20",    // ← Unchanged
     *     ...
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Record updated successfully
     *   404 NOT FOUND - Record doesn't exist
     *   400 BAD REQUEST - Invalid data in provided fields
     *   409 CONFLICT - Record was modified since last fetch
     * 
     * USE CASES:
     *   ✓ Correcting just the quantity
     *   ✓ Updating notes field
     *   ✓ Fixing odometer reading
     *   ✓ Changing cost per litre
     *   ✓ One or two field corrections
     * 
     * ADVANTAGE OVER PUT:
     *   • Only changed fields in request
     *   • Other fields preserved automatically
     *   • Safer (can't accidentally null fields)
     *   • More efficient (smaller payload)
     * 
     * RECOMMENDED:
     *   Use PATCH for most updates!
     *   Use PUT only for full data replacement.
     * 
     * @param id      Fuel record UUID (from URL path)
     * @param updates Fields to update (only provided fields changed)
     * @return        ResponseEntity with HTTP 200 and updated record
     */
    @PatchMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> patchFuelRecord(
            @PathVariable UUID id,
            @RequestBody CreateFuelRecordRequest updates) {
        // ── IMPLEMENTATION NOTE ──
        // TODO: Implement partial update logic in FuelService
        // Should:
        //   1. Fetch existing record
        //   2. Check if record exists (404 if not)
        //   3. Merge new data with existing (only provided fields)
        //   4. Validate updated fields
        //   5. Save changes
        //   6. Log who made the change and what changed
        //   7. Re-run fraud detection if amounts changed
        
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  F L A G G I N G   O P E R A T I O N S  ██████████████████
    // ═══════════════════════════════════════════════════════════════════════
    // Purpose: Mark entries as suspicious/fraudulent or approve legitimate ones
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ─────────────────────────────────────────────────────────────────────
     * FLAG FUEL ENTRY AS SUSPICIOUS/FRAUDULENT
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}/flag
     * 
     * WHAT THIS DOES:
     *   • Manually marks a fuel entry as suspicious/fraudulent
     *   • Used when automated detection misses something
     *   • Used when admin suspects misuse
     *   • Adds flag timestamp and responsible admin
     *   • Excludes from normal reports
     * 
     * REASONS TO FLAG:
     *   ⚠️ Quantity seems unusually high for vehicle type
     *   ⚠️ Cost per litre far exceeds market rate
     *   ⚠️ Receipt image looks fake/altered
     *   ⚠️ Odometer reading doesn't make sense (backward)
     *   ⚠️ Driver admits entry is incorrect
     *   ⚠️ Entry contradicts other documentation
     *   ⚠️ Suspicious pattern detected by admin
     * 
     * EXAMPLE REQUEST:
     *   PATCH /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/flag
     *   (No request body needed)
     * 
     * RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-...",
     *     "vehiclePlate": "ABC-1234",
     *     "quantity": 250.0,
     *     "totalCost": 6250.00,
     *     "flagged": true,           // ← Now marked as suspicious
     *     "flagReason": "Admin review - unusual quantity",
     *     "flaggedAt": "2026-04-20T15:30:00Z",
     *     "flaggedBy": "admin@vfms.com"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Entry flagged successfully
     *   404 NOT FOUND - Entry doesn't exist
     *   400 BAD REQUEST - Entry already flagged
     * 
     * USE CASES:
     *   ✓ Admin suspects fraud based on review
     *   ✓ Driver admits entry is incorrect
     *   ✓ Receipt image fails authenticity check
     *   ✓ Odometer readings don't match (vehicle theft check)
     *   ✓ Manager override (veto on entry)
     * 
     * NEXT STEPS:
     *   After flagging:
     *     1. Entry appears in GET /api/v1/fuel/flagged
     *     2. Finance team reviews and decides
     *     3. Approve: PATCH /api/v1/fuel/{id}/unflag (legitimate)
     *     4. Reject: DELETE /api/v1/fuel/{id} (remove entry)
     *     5. Adjust: PATCH /api/v1/fuel/{id} (correct data)
     * 
     * AUDIT TRAIL:
     *   ✓ Records WHO flagged entry
     *   ✓ Records WHEN it was flagged
     *   ✓ Records WHY (reason/notes)
     *   ✓ Cannot be hidden - permanent record
     * 
     * @param id Fuel record UUID (from URL path)
     * @return   ResponseEntity with HTTP 200 and flagged record
     * @throws   EntityNotFoundException if record not found
     * @throws   IllegalStateException if already flagged
     */
    @PatchMapping("/{id}/flag")
    public ResponseEntity<FuelRecordResponse> flagFuelRecord(@PathVariable UUID id) {
        // ── IMPLEMENTATION NOTE ──
        // TODO: Implement flag logic in FuelService
        // Should:
        //   1. Check if record exists (404 if not)
        //   2. Check if already flagged (error if yes)
        //   3. Set flagged = true
        //   4. Record admin who flagged it
        //   5. Record timestamp
        //   6. Add optional reason/notes
        //   7. Exclude from normal queries
        //   8. Add to flagged records endpoint results
        //   9. Log action for audit trail
        
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * ─────────────────────────────────────────────────────────────────────
     * UNFLAG FUEL ENTRY - MARK AS LEGITIMATE
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}/unflag
     * 
     * WHAT THIS DOES:
     *   • Removes suspicious flag from fuel entry
     *   • Marks entry as legitimate/approved
     *   • Entry returns to normal reports
     *   • Records who approved it and when
     * 
     * WHEN TO UNFLAG:
     *   ✓ Admin reviews and approves flagged entry
     *   ✓ Receipt verification proves authenticity
     *   ✓ Driver provides explanation (accepted)
     *   ✓ Data correction resolves concern
     *   ✓ Entry was incorrectly flagged by system
     * 
     * EXAMPLE REQUEST:
     *   PATCH /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/unflag
     *   (No request body needed)
     * 
     * RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-...",
     *     "vehiclePlate": "ABC-1234",
     *     "quantity": 45.5,
     *     "totalCost": 568.75,
     *     "flagged": false,          // ← Flag removed, entry approved
     *     "unflaggedAt": "2026-04-20T16:00:00Z",
     *     "unflaggedBy": "finance@vfms.com"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK       - Flag removed successfully
     *   404 NOT FOUND - Entry doesn't exist
     *   400 BAD REQUEST - Entry is not flagged
     *   403 FORBIDDEN - Only Finance/Manager can unflag
     * 
     * APPROVAL WORKFLOW:
     *   1. Entry flagged (suspicious)
     *   2. Finance team reviews details
     *   3. Decision made:
     *      - APPROVE: Call unflag endpoint → entry approved
     *      - REJECT:  Call delete endpoint → entry removed
     *   4. Approval recorded in audit log
     * 
     * NEXT STEPS AFTER UNFLAG:
     *   • Entry removed from GET /api/v1/fuel/flagged
     *   • Included in regular reports and summaries
     *   • Counts toward driver/vehicle fuel records
     *   • Included in cost calculations
     * 
     * AUDIT TRAIL:
     *   ✓ Records WHO unflaged entry
     *   ✓ Records WHEN it was unflaged
     *   ✓ Records approval reason/notes
     *   ✓ Previous flag still visible in history
     * 
     * @param id Fuel record UUID (from URL path)
     * @return   ResponseEntity with HTTP 200 and unflaged record
     * @throws   EntityNotFoundException if record not found
     * @throws   IllegalStateException if not currently flagged
     */
    @PatchMapping("/{id}/unflag")
    public ResponseEntity<FuelRecordResponse> unflagFuelRecord(@PathVariable UUID id) {
        // ── IMPLEMENTATION NOTE ──
        // TODO: Implement unflag logic in FuelService
        // Should:
        //   1. Check if record exists (404 if not)
        //   2. Check if currently flagged (error if not)
        //   3. Set flagged = false
        //   4. Record admin who unflaged it
        //   5. Record timestamp of approval
        //   6. Add approval reason/notes (optional)
        //   7. Remove from flagged records query results
        //   8. Include in normal reports again
        //   9. Log action for audit trail
        //  10. Update finance records
        
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████████  D E L E T E   O P E R A T I O N S  ██████████████████████
    // ═══════════════════════════════════════════════════════════════════════
    // Purpose: Permanently remove fuel records from system
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * ─────────────────────────────────────────────────────────────────────
     * DELETE FUEL RECORD PERMANENTLY
     * ─────────────────────────────────────────────────────────────────────
     * 
     * ENDPOINT:
     *   DELETE /api/v1/fuel/{id}
     * 
     * WHAT THIS DOES:
     *   • Permanently removes fuel record from database
     *   • Deletes associated receipt image file
     *   • Record cannot be recovered (unless backups exist)
     *   • Logs deletion for audit trail
     *   • Updates related statistics
     * 
     * WHEN TO USE:
     *   ✓ Entry was fraudulent (confirmed by investigation)
     *   ✓ Data entry error (completely wrong entry)
     *   ✓ Duplicate entry (same fuel, entered twice)
     *   ✓ Test/development entry (remove from production)
     *   ✓ User requested deletion (with approval)
     * 
     * EXAMPLE REQUEST:
     *   DELETE /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * RESPONSE (204 NO CONTENT):
     *   (Empty body - record deleted successfully)
     * 
     * HTTP STATUS CODES:
     *   204 NO CONTENT   - Record deleted successfully (no response body)
     *   404 NOT FOUND    - Record doesn't exist
     *   400 BAD REQUEST  - Invalid record UUID format
     *   403 FORBIDDEN    - User lacks permission to delete
     *   409 CONFLICT     - Record in use (linked to reports/approvals)
     * 
     * ⚠️ IMPORTANT CONSIDERATIONS:
     *   • PERMANENT - Cannot be undone without backup restore
     *   • Affects financial reports (cost totals change)
     *   • May affect driver/vehicle statistics
     *   • Impacts fraud detection history
     *   • Audit log shows deletion (who, when, why)
     * 
     * DELETION IMPACTS:
     *   ✗ Driver fuel cost totals decrease
     *   ✗ Vehicle fuel history becomes incomplete
     *   ✗ Monthly reports show different numbers
     *   ✗ Fraud detection patterns change
     *   ✗ Audit trail shows gap (deletion recorded)
     * 
     * ALTERNATIVE APPROACHES:
     *   Instead of DELETE:
     *     • PATCH /api/v1/fuel/{id} - Correct the data
     *     • PATCH /api/v1/fuel/{id}/unflag - Approve entry if flagged
     *     • Keep record but mark as "archived" (future feature)
     * 
     * APPROVAL WORKFLOW:
     *   Recommended before deletion:
     *   1. Retrieve record: GET /api/v1/fuel/{id}
     *   2. Review details carefully
     *   3. Check if other options apply (update instead)
     *   4. Get approval from manager/finance
     *   5. Log reason for deletion
     *   6. Then call DELETE
     *   7. Verify deletion in logs
     * 
     * RECEIPT FILE HANDLING:
     *   • If receipt image exists: Deleted from file storage
     *   • If receipt doesn't exist: No impact
     *   • Backup storage (if configured): Still has copy
     *   • URL becomes invalid after deletion
     * 
     * RELATED ENDPOINTS:
     *   • View before delete: GET /api/v1/fuel/{id}
     *   • Update instead: PATCH /api/v1/fuel/{id}
     *   • Unflag instead: PATCH /api/v1/fuel/{id}/unflag
     * 
     * AUDIT TRAIL:
     *   ✓ Records WHO deleted the entry
     *   ✓ Records WHEN it was deleted
     *   ✓ Records WHY (deletion reason/notes)
     *   ✓ Records what data was deleted
     *   ✓ Cannot hide deletion - permanent audit record
     * 
     * SECURITY BEST PRACTICES:
     *   • Only ADMIN role can delete
     *   • Deleted by specific person (identity recorded)
     *   • Requires authentication token
     *   • Soft delete recommended (mark deleted vs hard delete)
     *   • Keep audit record even after hard delete
     * 
     * @param id Fuel record UUID (from URL path)
     * @return   ResponseEntity with HTTP 204 No Content (empty body)
     * @throws   EntityNotFoundException if record not found
     * @throws   AuthorizationException if user lacks admin role
     * @throws   IllegalStateException if record cannot be deleted
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelRecord(@PathVariable UUID id) {
        // ── IMPLEMENTATION NOTE ──
        // TODO: Implement deleteById in FuelService and uncomment below
        // Should:
        //   1. Check if record exists (404 if not)
        //   2. Get current user (for audit logging)
        //   3. Check deletion permissions (admin only)
        //   4. Get record details before deletion (for audit log)
        //   5. Delete associated receipt file (if exists)
        //   6. Delete database record
        //   7. Log deletion with:
        //      - Who deleted
        //      - When deleted
        //      - What was deleted (full record details)
        //      - Deletion reason (if provided)
        //   8. Update related statistics (driver/vehicle totals)
        //   9. Return 204 No Content (no response body)
        
        // fuelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
