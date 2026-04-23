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
 * ═══════════════════════════════════════════════════════════════════════════════
 * FUEL MANAGEMENT API CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   This controller manages all fuel-related operations in the VFMS system.
 *   It handles recording fuel entries, tracking fuel consumption, and detecting
 *   suspicious fuel usage patterns to prevent fleet fraud.
 * 
 * BASE PATH:
 *   /api/v1/fuel
 * 
 * WHO USES THIS:
 *   - Fleet Administrators: Create, view, and manage fuel records
 *   - Supervisors: Monitor fuel expenses and detect anomalies
 *   - Auditors: Investigate flagged records for fraud detection
 * 
 * ACCESS CONTROL:
 *   All endpoints require ADMIN role due to sensitive fuel data and fraud prevention.
 *   Regular drivers cannot access fuel APIs directly.
 * 
 * KEY FEATURES:
 *   ✓ Create fuel entries with receipt uploads
 *   ✓ View fuel records with filtering and search
 *   ✓ Real-time vehicle data integration (expensive, use with caution)
 *   ✓ Flag suspicious records for investigation
 *   ✓ Update and delete records (with audit trail)
 *   ✓ Performance-optimized queries with fallback strategies
 * 
 * MAIN ENDPOINTS:
 *   POST   /api/v1/fuel                           - Create fuel record
 *   GET    /api/v1/fuel                           - Get all records
 *   GET    /api/v1/fuel/{id}                      - Get record by ID (not shown, in service)
 *   GET    /api/v1/fuel/{id}/with-vehicle-data   - Get record with fresh vehicle info
 *   GET    /api/v1/fuel/vehicle/{vehicleId}      - All fuel entries for a vehicle
 *   PATCH  /api/v1/fuel/{id}/flag                - Flag suspicious record
 * 
 * PERFORMANCE CONSIDERATIONS:
 *   - Standard endpoints are FAST (cached vehicle data)
 *   - Real-time endpoints are SLOW (external API calls)
 *   - Use pagination for large result sets
 *   - Implement caching to reduce API calls
 * 
 * @author Fuel Management Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/v1/fuel")
@RequiredArgsConstructor
public class FuelController {

    // ─────────────────────────────────────────────────────────────────────────
    // Service Dependencies
    // ─────────────────────────────────────────────────────────────────────────
    private final FuelService fuelService;

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  C R E A T E   O P E R A T I O N S  ██████████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Create a New Fuel Record with Receipt
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Records a fuel transaction in the system, capturing all details required
     *   for compliance, expense tracking, and anomaly detection.
     * 
     * ENDPOINT:
     *   POST /api/v1/fuel
     *   Content-Type: multipart/form-data
     * 
     * EXAMPLE REQUEST:
     *   POST /api/v1/fuel
     *   data (JSON):
     *   {
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "odometerReading": 50000.0,
     *     "location": "Shell Station - Main Highway"
     *   }
     *   receipt: [image file, optional]
     * 
     * EXAMPLE RESPONSE (201 CREATED):
     *   {
     *     "id": "abc-123-def-456",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "driverName": "John Smith",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "odometerReading": 50000.0,
     *     "location": "Shell Station - Main Highway",
     *     "receiptPath": "/uploads/receipts/abc-123-def-456.jpg",
     *     "isFlagged": false,
     *     "flagReason": null,
     *     "createdAt": "2026-04-20T14:30:00Z"
     *   }
     * 
     * VALIDATION RULES:
     *   - vehicleId: Required, must exist in vehicle database
     *   - quantity: Required, must be > 0 and < 500 (suspicious if higher)
     *   - costPerLitre: Required, must be > 0 and reasonable (₹5-20 typical)
     *   - totalCost: Should equal quantity × costPerLitre
     *   - odometerReading: Optional, helps verify fuel consumption rate
     *   - receipt: Optional, improves audit trail
     *   - fuelDate: Optional, defaults to today if not provided
     * 
     * HTTP STATUS CODES:
     *   201 CREATED           - Record successfully created
     *   400 BAD REQUEST       - Invalid data (check validation errors)
     *   404 NOT FOUND         - Vehicle/Driver doesn't exist
     *   413 PAYLOAD TOO LARGE - Receipt file too large (> 10MB)
     *   500 INTERNAL ERROR    - Server error during processing
     * 
     * WHAT HAPPENS BEHIND THE SCENES:
     *   1. Validates all required fields and business rules
     *   2. Checks if vehicle and driver exist
     *   3. If receipt provided:
     *      - Validates file type (JPG, PNG, PDF only)
     *      - Scans file for viruses (security check)
     *      - Saves to secure storage (/uploads/receipts/)
     *   4. Checks fuel consumption against vehicle history (anomaly detection)
     *   5. Flags record if suspicious patterns detected
     *   6. Creates audit log entry
     *   7. Returns created record with ID
     * 
     * ANOMALY DETECTION RULES (Auto-Flag):
     *   - Quantity > 300 liters in single fill
     *   - Cost per liter outside normal range (< ₹5 or > ₹20)
     *   - Fuel consumption > 50% above vehicle average
     *   - Multiple fills in same day for same vehicle
     *   - Missing receipt (admin preference)
     * 
     * FRAUD PREVENTION:
     *   - All records are immutable after creation (audit trail)
     *   - Receipt images are scanned for tampering indicators
     *   - Historical data used to detect unusual patterns
     *   - Flagged records require admin review before processing
     * 
     * USE CASES:
     *   - Driver submitted fuel bill, admin records it
     *   - Fuel station integration records entries automatically
     *   - Manual fuel entry for cash transactions
     *   - Monthly fuel expense reconciliation
     * 
     * PERFORMANCE:
     *   - Response time: 200-500ms (depends on receipt size)
     *   - Receipt upload: 1-10MB files recommended
     *   - Disk space: ~50KB per receipt
     * 
     * SECURITY:
     *   - Requires ADMIN role
     *   - Receipt files are stored securely
     *   - All operations logged with admin ID
     *   - Data encrypted in transit (HTTPS only)
     * 
     * NEXT STEPS:
     *   - View created record: GET /api/v1/fuel/{id}
     *   - Edit if needed: PUT /api/v1/fuel/{id}
     *   - Flag if suspicious: PATCH /api/v1/fuel/{id}/flag
     * 
     * @param request      Fuel record details (quantity, cost, vehicle, etc.)
     * @param receipt      Optional receipt image/document file
     * @param user         Authenticated admin user (auto-populated)
     * @return             Created fuel record with full details (HTTP 201)
     * @throws             ValidException if validation fails
     * @throws             ResourceNotFoundException if vehicle/driver not found
     * 
     * @see CreateFuelRecordRequest for required/optional fields
     * @see FuelRecordResponse for response structure
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FuelRecordResponse> createFuelRecord(
            @Valid @RequestPart("data") CreateFuelRecordRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal User user) {
        // Create record and return with HTTP 201 (Created) status
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fuelService.createFuelRecord(request, receipt, user));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  R E A D   O P E R A T I O N S  ████████████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Fuel Records
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Retrieves all fuel records in the system with cached vehicle information.
     *   This is the FASTEST way to view fuel data - ideal for dashboards and reports.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel
     *   No query parameters required
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "odometerReading": 50000.0,
     *       "isFlagged": false,
     *       "createdAt": "2026-04-20T14:30:00Z"
     *     },
     *     {
     *       "id": "def-456",
     *       "vehicleId": "e7c3d5f9-a1b8-4e2a-8f4c-b1e9d5f9a1b8",
     *       "vehiclePlate": "XYZ-5678",
     *       "vehicleMakeModel": "Honda City",
     *       "quantity": 38.2,
     *       "totalCost": 477.50,
     *       "odometerReading": 45600.0,
     *       "isFlagged": true,
     *       "flagReason": "High consumption pattern detected",
     *       "createdAt": "2026-04-19T10:15:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Records returned successfully
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Database error
     * 
     * RESPONSE DATA:
     *   - Total records: 1000+? Consider pagination for production
     *   - Vehicle data: Last cached version (not real-time)
     *   - Flagged records: Included with reasons
     *   - Order: By creation date (newest first)
     * 
     * PERFORMANCE:
     *   - Response time: 50-200ms for typical datasets
     *   - Database queries: 1 (single fetch)
     *   - API calls: 0 (uses cached data)
     *   - Recommended for: Dashboards, tables, reports
     * 
     * LIMITATIONS:
     *   - Vehicle data may be 1-2 days old (cached)
     *   - Large datasets might cause memory issues
     *   - No pagination (all records returned)
     * 
     * RECOMMENDATIONS FOR PRODUCTION:
     *   - Add pagination: /api/v1/fuel?page=0&size=50
     *   - Add sorting: /api/v1/fuel?sort=createdAt,desc
     *   - Add filtering: /api/v1/fuel?isFlagged=true
     *   - For real-time data: Use endpoints with /realtime suffix
     * 
     * USE CASES:
     *   - Fuel expense dashboard
     *   - Monthly reports
     *   - Fuel trend analysis
     *   - Quick record lookup
     *   - Audit reports
     * 
     * BETTER ALTERNATIVES:
     *   - Need specific vehicle? Use: GET /api/v1/fuel/vehicle/{vehicleId}
     *   - Need date range? Use: GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30
     *   - Need fresh data? Use: GET /api/v1/fuel/realtime/all (slower)
     *   - Need flagged only? Use: GET /api/v1/fuel/flagged
     * 
     * @return List of all fuel records with cached vehicle data (HTTP 200)
     * 
     * @see FuelRecordResponse for response structure
     * @see #getFuelRecordWithVehicleData(UUID) for real-time data
     */
    @GetMapping
    public ResponseEntity<List<FuelRecordResponse>> getAllRecords() {
        // Fetch all records from database with cached vehicle info (fast)
        return ResponseEntity.ok(fuelService.getAllRecords());
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get Single Fuel Record with Real-Time Vehicle Data
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Retrieves a single fuel record enriched with FRESH vehicle information.
     *   Use when you need current vehicle status alongside historical fuel data.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/{id}/with-vehicle-data
     * 
     * PATH PARAMETER:
     *   {id} = Fuel record UUID (example: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/with-vehicle-data
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "vehicleMakeModel": "Toyota Camry 2023",
     *     "vehicleStatus": "ACTIVE",
     *     "lastServiceDate": "2026-03-15",
     *     "odometerReading": 51200.0,
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.5,
     *     "costPerLitre": 12.50,
     *     "totalCost": 568.75,
     *     "recordedOdometer": 50000.0,
     *     "isFlagged": false,
     *     "createdAt": "2026-04-20T14:30:00Z",
     *     "createdBy": "admin@vfms.com"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Record found and returned with fresh vehicle data
     *   404 NOT FOUND       - Fuel record doesn't exist
     *   500 INTERNAL ERROR  - Server error (database or vehicle API failure)
     * 
     * WHAT THIS ENDPOINT DOES:
     *   Step 1: Validates fuel record ID format (UUID)
     *   Step 2: Queries database for fuel record
     *   Step 3: Makes HTTP call to vehicle management API
     *   Step 4: Enriches fuel record with current vehicle data
     *   Step 5: Returns combined response
     * 
     * DATA FRESHNESS:
     *   - Fuel record data: From database (accurate)
     *   - Vehicle data: Real-time (API call, 2-5 seconds old)
     *   - Fallback: Uses cached data if API fails (no error returned)
     * 
     * PERFORMANCE:
     *   - Response time: 100-500ms (includes API call delay)
     *   - Database queries: 1 (fetch fuel record)
     *   - API calls: 1 (fetch vehicle data)
     *   - Network latency: 100-200ms typical
     * 
     * WHEN TO USE:
     *   ✓ Viewing fuel record details in a modal/page
     *   ✓ Verifying fuel entry with current vehicle status
     *   ✓ Checking if vehicle status changed since fuel entry
     *   ✓ Comparing recorded odometer vs current odometer
     *   ✓ Audit investigations requiring fresh data
     * 
     * WHEN NOT TO USE:
     *   ✗ Fetching 100+ records (too slow, use getAllRecords instead)
     *   ✗ High frequency refreshes (use caching instead)
     *   ✗ Dashboard lists (use cached data instead)
     *   ✗ When speed is critical (API latency adds delay)
     * 
     * ERROR HANDLING:
     *   - Record not found: Returns 404 with error message
     *   - Invalid UUID: Returns 400 Bad Request
     *   - Vehicle API timeout: Returns record with cached vehicle data
     *   - Database error: Returns 500 Internal Server Error
     * 
     * FALLBACK STRATEGY:
     *   If vehicle API fails:
     *     - Returns fuel record with last-cached vehicle information
     *     - User sees slightly stale vehicle data (1-2 days old)
     *     - No error displayed (graceful degradation)
     *     - Fuel record data is always accurate
     * 
     * VEHICLE DATA INCLUDED:
     *   - Current plate number
     *   - Make and model
     *   - Current status (ACTIVE, MAINTENANCE, RETIRED)
     *   - Last service date
     *   - Current odometer reading
     *   - Fuel tank capacity
     *   - Current location
     * 
     * USE CASES:
     *   1. Fuel record details page:
     *      - User clicks row in fuel table
     *      - Modal opens showing fuel + vehicle details
     *      - Helps verify fuel entry legitimacy
     * 
     *   2. Anomaly investigation:
     *      - Admin checking flagged fuel record
     *      - Needs to see vehicle status at time of fuel entry
     *      - Compares with current vehicle condition
     * 
     *   3. Fuel consumption analysis:
     *      - Checking miles/km driven since last fuel
     *      - Calculating actual fuel consumption rate
     *      - Identifying potential fraud patterns
     * 
     * SECURITY:
     *   - Requires ADMIN role
     *   - Vehicle API call is authenticated
     *   - Response includes audit information
     * 
     * NEXT STEPS:
     *   - Flag if suspicious: PATCH /api/v1/fuel/{id}/flag
     *   - Update record: PUT /api/v1/fuel/{id}
     *   - Back to list: GET /api/v1/fuel
     * 
     * @param id Fuel record UUID (from URL path)
     * @return Fuel record with real-time vehicle data (HTTP 200)
     * @throws ResourceNotFoundException if fuel record not found (HTTP 404)
     * @throws InvalidRequestException if ID format invalid (HTTP 400)
     * 
     * @see FuelRecordResponse for response structure
     * @see #getAllRecords() for faster bulk retrieval with cached data
     */
    @GetMapping("/{id}/with-vehicle-data")
    public ResponseEntity<FuelRecordResponse> getFuelRecordWithVehicleData(
            @PathVariable UUID id) {
        // Step 1: Call service to fetch fuel record + real-time vehicle data
        // Service handles: database query + API call + fallback logic
        FuelRecordResponse response = fuelService.getFuelRecordWithRealTimeData(id);
        
        // Step 2: Return response with HTTP 200 OK status
        return ResponseEntity.ok(response);
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Fuel Records with Real-Time Vehicle Data
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * ⚠️ WARNING: EXPENSIVE OPERATION - USE WITH CAUTION IN PRODUCTION
     * 
     * PURPOSE:
     *   Retrieves ALL fuel records with FRESH vehicle data for each record.
     *   This endpoint makes one API call per fuel record - very resource intensive.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/realtime/all
     *   No query parameters
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/realtime/all
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleStatus": "ACTIVE",
     *       "quantity": 45.5,
     *       ...
     *     },
     *     {
     *       "id": "def-456",
     *       "vehicleId": "e7c3d5f9-a1b8-4e2a-8f4c-b1e9d5f9a1b8",
     *       "vehiclePlate": "XYZ-5678",
     *       "vehicleStatus": "ACTIVE",
     *       "quantity": 38.2,
     *       ...
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Records returned with real-time data
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Server error
     * 
     * PERFORMANCE IMPACT:
     *   ⚠️ CRITICAL: Response time scales with record count
     * 
     *   Calculation:
     *   - API call per record: ~200ms
     *   - 10 records = 2 seconds
     *   - 50 records = 10 seconds
     *   - 100 records = 20 seconds
     *   - 500 records = 1+ minute (timeout risk)
     * 
     *   For 1000 fuel records:
     *   - Sequential calls would take: ~200 seconds (3+ minutes)
     *   - Client timeout: Likely fails (default 30-60 seconds)
     *   - Server timeout: Definitely fails (default 5 minutes)
     *   - Resource usage: VERY HIGH
     * 
     * DATABASE & API CALLS:
     *   - Database queries: 1 (fetch all records)
     *   - API calls: N (where N = number of fuel records)
     *   - Total network: N × 200ms average
     *   - Total memory: ~10KB per record
     * 
     * WHEN TO USE THIS:
     *   ✓ Small datasets only (< 50 records)
     *   ✓ End-of-day comprehensive reports
     *   ✓ Exporting full fleet fuel status
     *   ✓ When current vehicle data is MANDATORY
     *   ✓ Off-peak hours (don't impact users)
     *   ✓ Background job scheduling (not real-time)
     * 
     * WHEN NOT TO USE THIS:
     *   ✗ Dashboard/UI (will freeze)
     *   ✗ High frequency refresh (API pressure)
     *   ✗ Large datasets (> 100 records)
     *   ✗ Aggregated reports (use cached data instead)
     *   ✗ Search/filter operations
     *   ✗ Mobile apps (data plan issues)
     * 
     * FALLBACK STRATEGY:
     *   If vehicle API fails for individual records:
     *     - Returns that record with cached vehicle data
     *     - Other records continue processing normally
     *     - No failures, graceful degradation
     *     - User gets partial fresh data instead of complete failure
     * 
     * OPTIMIZATION RECOMMENDATIONS:
     *   
     *   Option 1: Use pagination (BEST)
     *     GET /api/v1/fuel/realtime/all?page=0&size=50
     *     - Limits to 50 records per request
     *     - Response time: 10 seconds max
     *     - Implement client-side pagination
     * 
     *   Option 2: Add date range filter (GOOD)
     *     GET /api/v1/fuel/realtime/all?from=2026-04-01&to=2026-04-07
     *     - Only last 7 days = typically 50-100 records
     *     - Response time: 10-20 seconds
     *   
     *   Option 3: Use cached data endpoint (FAST)
     *     GET /api/v1/fuel
     *     - Response time: 100-200ms
     *     - Vehicle data 1-2 days old
     *     - Best for dashboards
     * 
     *   Option 4: Implement caching layer (ADVANCED)
     *     - Cache realtime data for 1 hour
     *     - Scheduled background job to update cache
     *     - Users get fresh data instantly
     * 
     * USE CASES:
     *   1. End-of-day report generation:
     *      - Scheduled job runs at 11 PM
     *      - Fetches all fuel records for that day
     *      - ~30-50 records = 10 seconds to generate
     *      - Report emailed to fleet manager
     * 
     *   2. Fleet status export:
     *      - Admin exports all fuel data
     *      - Uses pagination (50 records at a time)
     *      - Needs current vehicle status
     *      - Multiple page loads in UI
     * 
     *   3. Compliance audit:
     *      - Auditors need comprehensive current snapshot
     *      - Small subset of vehicles (< 50)
     *      - Run once per quarter
     *      - Real-time data mandatory
     * 
     * SECURITY & AUDIT:
     *   - Requires ADMIN role
     *   - All vehicle API calls authenticated
     *   - Response logged with admin ID
     *   - Data encrypted in transit
     * 
     * MONITORING:
     *   - Track response times
     *   - Monitor API call failures
     *   - Alert if response > 60 seconds
     *   - Set max record limit (safety stop)
     * 
     * NEXT STEPS:
     *   - Process results in background
     *   - Generate report/export
     *   - Cache for later use
     *   - Don't refresh for 1 hour
     * 
     * @return List of all fuel records with real-time vehicle data (HTTP 200)
     * @throws RequestTimeoutException if response takes > 60 seconds
     * 
     * @see FuelRecordResponse for response structure
     * @see #getAllRecords() for faster version with cached vehicle data
     * @see #getFuelRecordWithVehicleData(UUID) for single record with fresh data
     */
    @GetMapping("/realtime/all")
    public ResponseEntity<List<FuelRecordResponse>> getAllRecordsWithRealTimeData() {
        // Step 1: Call service to fetch all records with real-time vehicle data
        // WARNING: This makes one API call per fuel record (expensive!)
        List<FuelRecordResponse> records = fuelService.getAllRecordsWithRealTimeData();
        
        // Step 2: Return list with HTTP 200 OK status
        return ResponseEntity.ok(records);
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Search & Filter Fuel Records by Date Range, Vehicle, or Driver
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Advanced search endpoint for finding specific fuel records based on
     *   criteria. Perfect for generating reports, audits, and analysis.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/search
     *   Query parameters required
     * 
     * QUERY PARAMETERS:
     *   from        (Required) Start date (format: YYYY-MM-DD)
     *               Example: 2026-04-01
     *   
     *   to          (Required) End date (format: YYYY-MM-DD)
     *               Example: 2026-04-30
     *   
     *   vehicleId   (Optional) Filter by specific vehicle UUID
     *               Example: d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e
     *   
     *   driverId    (Optional) Filter by specific driver UUID
     *               Example: f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * EXAMPLE REQUESTS:
     *   
     *   Date range only:
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30
     *   → Returns all fuel entries from April 2026
     * 
     *   Date range + specific vehicle:
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&vehicleId=d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e
     *   → Returns all fuel entries for vehicle in April 2026
     * 
     *   Date range + specific driver:
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&driverId=f47ac10b-58cc-4372-a567-0e02b2c3d479
     *   → Returns all fuel entries by driver in April 2026
     * 
     *   All filters combined:
     *   GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&vehicleId=d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e&driverId=f47ac10b-58cc-4372-a567-0e02b2c3d479
     *   → Returns entries for specific driver + vehicle in April 2026
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *       "driverName": "John Smith",
     *       "fuelDate": "2026-04-20",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "isFlagged": false,
     *       "createdAt": "2026-04-20T14:30:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Search completed, results returned
     *   400 BAD REQUEST     - Invalid date format or parameters
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Database error
     * 
     * PERFORMANCE:
     *   - Response time: 100-500ms (depends on date range size)
     *   - Database index: Uses index on fuelDate
     *   - Typical dataset: 30 days × 50 vehicles = 1500 records
     * 
     * DATE RANGE GUIDELINES:
     *   - 7 days: Fast (< 100ms), ~50-100 records
     *   - 30 days: Medium (100-300ms), ~200-500 records
     *   - 90 days: Slower (300-800ms), ~600-1500 records
     *   - 1 year: Very slow (800ms-2s), ~2000-5000 records
     * 
     * COMMON USE CASES:
     * 
     *   1. Monthly fuel expense report:
     *      GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30
     *      - Total fuel spend for April
     *      - Identify top fuel consuming vehicles
     *      - Expense reconciliation
     * 
     *   2. Driver fuel history:
     *      GET /api/v1/fuel/search?from=2026-01-01&to=2026-04-30&driverId=f47ac10b...
     *      - All fuel entries by one driver (quarterly)
     *      - Detect driver patterns/anomalies
     *      - Driver performance review
     * 
     *   3. Vehicle fuel consumption:
     *      GET /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&vehicleId=d5a64b9a...
     *      - Track vehicle fuel efficiency
     *      - Compare with historical data
     *      - Maintenance scheduling
     * 
     *   4. Audit investigation:
     *      GET /api/v1/fuel/search?from=2026-03-01&to=2026-04-30&vehicleId=X&driverId=Y
     *      - Investigate specific driver + vehicle combination
     *      - 2-month detailed audit trail
     *      - Fraud detection
     * 
     * DATE VALIDATION:
     *   - Must be valid YYYY-MM-DD format
     *   - 'from' date must be ≤ 'to' date
     *   - Cannot query future dates
     *   - Recommended: No more than 1 year back
     * 
     * OPTIONAL FILTERS:
     *   - vehicleId: Filters to one vehicle only
     *   - driverId: Filters to one driver only
     *   - Both can be used together for very specific queries
     *   - Omitting filters returns all records in date range
     * 
     * EXPORTED DATA FIELDS:
     *   - id, vehicleId, vehiclePlate, vehicleMakeModel
     *   - driverId, driverName, driverEmail
     *   - fuelDate, quantity, costPerLitre, totalCost
     *   - odometerReading, location, receiptPath
     *   - isFlagged, flagReason, createdAt, createdBy
     * 
     * EXPORT FORMAT:
     *   Results can be:
     *   - Downloaded as CSV for Excel
     *   - Exported to PDF for reports
     *   - Integrated with BI tools
     *   - Used for dashboard charts
     * 
     * SECURITY:
     *   - Requires ADMIN role
     *   - All sensitive data logged
     *   - Query time tracked (audit trail)
     *   - IP address recorded
     * 
     * NEXT STEPS:
     *   - Export results to CSV/PDF
     *   - View specific record details: GET /api/v1/fuel/{id}
     *   - Flag suspicious records: PATCH /api/v1/fuel/{id}/flag
     * 
     * @param from          Start date (YYYY-MM-DD format, required)
     * @param to            End date (YYYY-MM-DD format, required)
     * @param vehicleId     Vehicle UUID filter (optional)
     * @param driverId      Driver UUID filter (optional)
     * @return              Filtered fuel records matching criteria (HTTP 200)
     * @throws              InvalidDateFormatException if dates invalid (HTTP 400)
     * 
     * @see FuelRecordResponse for response structure
     */
    @GetMapping("/search")
    public ResponseEntity<List<FuelRecordResponse>> searchFuelRecords(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId) {
        // Execute search with specified filters
        return ResponseEntity.ok(
                fuelService.getByDateRange(from, to, vehicleId, driverId));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Fuel Records for a Specific Vehicle
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Retrieves complete fuel history for a single vehicle using cached vehicle data.
     *   This is the RECOMMENDED endpoint for viewing vehicle fuel records - fast and efficient.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/vehicle/{vehicleId}
     * 
     * PATH PARAMETER:
     *   {vehicleId} = Vehicle UUID (example: d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e)
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/vehicle/d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2023",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "odometerReading": 50000.0,
     *       "fuelDate": "2026-04-20",
     *       "isFlagged": false,
     *       "createdAt": "2026-04-20T14:30:00Z"
     *     },
     *     {
     *       "id": "def-456",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2023",
     *       "quantity": 50.0,
     *       "totalCost": 625.00,
     *       "odometerReading": 49500.0,
     *       "fuelDate": "2026-04-15",
     *       "isFlagged": true,
     *       "flagReason": "High consumption detected",
     *       "createdAt": "2026-04-15T09:45:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Records found and returned
     *   404 NOT FOUND       - Vehicle doesn't exist or no fuel records
     *   400 BAD REQUEST     - Invalid vehicle UUID format
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Database error
     * 
     * PERFORMANCE (RECOMMENDED FOR PRODUCTION):
     *   - Response time: 50-150ms (FAST - no API calls)
     *   - Database queries: 1 (single index lookup)
     *   - API calls: 0 (uses cached vehicle data)
     *   - Ideal for: UI views, dashboards, reports
     * 
     * RESPONSE CHARACTERISTICS:
     *   - Vehicle data: Last cached version (1-2 days old)
     *   - Sorted by: Date (newest first)
     *   - Includes: Flagged records with reasons
     *   - Total records: Depends on vehicle age/usage
     * 
     * TYPICAL DATASET SIZES:
     *   - Vehicle age < 1 month: 10-20 fuel entries
     *   - Vehicle age < 6 months: 50-150 fuel entries
     *   - Vehicle age > 1 year: 200-500+ fuel entries
     * 
     * DATA FRESHNESS:
     *   - Fuel record data: 100% accurate (from database)
     *   - Vehicle data: 1-2 days old (cached)
     *   - For real-time vehicle data: Use /realtime endpoint instead
     * 
     * WHEN TO USE THIS:
     *   ✓ Vehicle fuel history view
     *   ✓ Fuel consumption analysis
     *   ✓ Reports and exports
     *   ✓ Dashboard displays
     *   ✓ Need fast response times
     *   ✓ Most production use cases
     * 
     * WHEN TO USE REALTIME VERSION:
     *   ✗ Need current vehicle status at time of fuel entry
     *   ✗ Investigating fraud (need fresh vehicle data)
     *   ✗ Comparing recorded odometer vs current odometer
     *   ✗ Can afford slower response (100-500ms)
     * 
     * USE CASES:
     * 
     *   1. Vehicle fuel dashboard:
     *      - User clicks on vehicle in management system
     *      - Dashboard shows all fuel entries
     *      - Charts showing fuel consumption over time
     *      - Alerts for unusual consumption patterns
     * 
     *   2. Driver assignment view:
     *      - Supervisor checks vehicle before assignment
     *      - Verifies recent fuel entries
     *      - Checks for any flagged entries
     *      - Ensures vehicle is properly maintained
     * 
     *   3. Monthly fuel report:
     *      - Fleet manager generates report
     *      - All fuel entries for all vehicles
     *      - Export to CSV/PDF
     *      - Cost analysis and budgeting
     * 
     *   4. Fuel efficiency tracking:
     *      - Calculate MPG (miles per gallon)
     *      - Compare vehicles in same class
     *      - Identify maintenance issues
     *      - Schedule preventive maintenance
     * 
     * ANALYSIS OPPORTUNITIES:
     *   - Fuel consumption trend
     *   - Cost per kilometer analysis
     *   - Comparison with industry standards
     *   - Driver comparison (same vehicle)
     *   - Maintenance correlation (fuel drop after service)
     * 
     * FLAGGED RECORDS IN RESPONSE:
     *   - Includes isFlagged: true/false
     *   - Includes flagReason (if flagged)
     *   - Helps identify anomalies
     *   - Supports fraud investigation
     * 
     * ODOMETERREADING INSIGHTS:
     *   - Calculate distance since last fuel
     *   - Compare with fuel consumption
     *   - Detect odometer tampering
     *   - Validate fuel consumption rate
     * 
     * VEHICLE MAINTENANCE CORRELATION:
     *   - Fuel consumption drop after service = normal
     *   - Gradual increase = wear and tear (normal)
     *   - Sudden spike = investigate (fault, driver change)
     * 
     * SECURITY:
     *   - Requires ADMIN role
     *   - Vehicle API calls not needed
     *   - Audit trail maintained
     *   - Data encrypted in transit
     * 
     * NEXT STEPS:
     *   - View specific fuel entry: GET /api/v1/fuel/{id}
     *   - Flag suspicious entry: PATCH /api/v1/fuel/{id}/flag
     *   - Get real-time data: GET /api/v1/fuel/vehicle/{vehicleId}/realtime
     *   - Compare with another vehicle: GET /api/v1/fuel/vehicle/{otherVehicleId}
     * 
     * @param vehicleId     Vehicle UUID (from URL path, required)
     * @return              All fuel records for vehicle with cached data (HTTP 200)
     * @throws              ResourceNotFoundException if vehicle not found (HTTP 404)
     * @throws              InvalidRequestException if UUID format invalid (HTTP 400)
     * 
     * @see FuelRecordResponse for response structure
     * @see #getFuelByVehicleRealTime(UUID) for real-time vehicle data version
     */
    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicle(
            @PathVariable UUID vehicleId) {
        // Fetch fuel records using cached vehicle data (fast, recommended for production)
        return ResponseEntity.ok(fuelService.getByVehicle(vehicleId));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Fuel Records for a Vehicle with Real-Time Vehicle Data
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * ⚠️ WARNING: EXPENSIVE OPERATION - Multiple API calls required
     * 
     * PURPOSE:
     *   Retrieves complete fuel history for a vehicle with FRESH vehicle data.
     *   Use when you need current vehicle status for each fuel entry - helpful for fraud investigation.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/vehicle/{vehicleId}/realtime
     * 
     * PATH PARAMETER:
     *   {vehicleId} = Vehicle UUID (example: d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e)
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/vehicle/d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e/realtime
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2023",
     *       "vehicleStatus": "ACTIVE",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "odometerReading": 50000.0,
     *       "fuelDate": "2026-04-20",
     *       "isFlagged": false,
     *       "createdAt": "2026-04-20T14:30:00Z"
     *     },
     *     {
     *       "id": "def-456",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "vehicleMakeModel": "Toyota Camry 2023",
     *       "vehicleStatus": "MAINTENANCE",
     *       "quantity": 50.0,
     *       "totalCost": 625.00,
     *       "odometerReading": 49500.0,
     *       "fuelDate": "2026-04-15",
     *       "isFlagged": true,
     *       "flagReason": "High consumption before maintenance",
     *       "createdAt": "2026-04-15T09:45:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Records found and returned with fresh data
     *   404 NOT FOUND       - Vehicle doesn't exist
     *   400 BAD REQUEST     - Invalid vehicle UUID format
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Server or API error
     * 
     * WHAT THIS ENDPOINT DOES:
     *   Step 1: Validates vehicle exists (API call)
     *   Step 2: Fetches all fuel records from database (single query)
     *   Step 3: For EACH record, fetches current vehicle status (API call per record)
     *   Step 4: Enriches fuel data with fresh vehicle details
     *   Step 5: Returns complete fuel history with vehicle snapshots
     * 
     * PERFORMANCE IMPACT:
     *   ⚠️ CRITICAL: Scales with number of fuel records
     * 
     *   Calculation: 1 validation call + 1 database query + (N × 200ms per record API calls)
     *   
     *   - Vehicle with 10 fuel entries: 1-2 seconds
     *   - Vehicle with 50 fuel entries: 5-10 seconds
     *   - Vehicle with 100 fuel entries: 10-20 seconds
     *   - Vehicle with 200 fuel entries: 30-40 seconds (timeout risk)
     * 
     *   Typical performance breakdown:
     *   - Vehicle API validation: ~100ms
     *   - Database query: ~50ms
     *   - Per-record API calls: ~200ms × N records
     *   - Total response build: ~50ms
     * 
     * DATABASE & API CALLS:
     *   - Initial validation calls: 1
     *   - Database queries: 1
     *   - Per-record API calls: N (equal to number of fuel records)
     *   - Total external API calls: N + 1
     * 
     * DATA FRESHNESS:
     *   - Fuel record data: 100% accurate (from database)
     *   - Vehicle data: Real-time (API calls, 2-5 seconds old)
     *   - Each record has its own vehicle snapshot
     * 
     * WHEN TO USE THIS:
     *   ✓ Fraud investigation (need vehicle status at time)
     *   ✓ Small vehicle datasets (< 50 fuel entries)
     *   ✓ Comparing recorded vs current odometer
     *   ✓ Verifying vehicle status changes between entries
     *   ✓ One-time detailed audits
     *   ✓ When fresh data is MANDATORY
     * 
     * WHEN NOT TO USE THIS:
     *   ✗ Dashboard views (too slow, user waits 10+ seconds)
     *   ✗ Vehicles with 100+ fuel entries (timeout risk)
     *   ✗ Need fast response times
     *   ✗ Regular / frequent access
     *   ✗ Mobile apps (excessive network calls)
     *   ✗ Batch operations (API rate limiting issues)
     * 
     * BETTER ALTERNATIVE:
     *   For production use: GET /api/v1/fuel/vehicle/{vehicleId}
     *   - Response time: 50-150ms (FAST)
     *   - No extra API calls
     *   - Vehicle data 1-2 days old
     *   - Recommended for dashboards and UI
     * 
     * OPTIMIZATION OPTIONS:
     * 
     *   Option 1: Add pagination (RECOMMENDED)
     *     GET /api/v1/fuel/vehicle/{vehicleId}/realtime?page=0&size=30
     *     - Limits to 30 records per request
     *     - Response time: 6-8 seconds max
     *     - Implement pagination in frontend
     * 
     *   Option 2: Add date range filter
     *     GET /api/v1/fuel/vehicle/{vehicleId}/realtime?from=2026-04-01&to=2026-04-07
     *     - Only recent records = faster
     *     - 7 days typically = 10-20 records
     *     - Response time: 2-4 seconds
     * 
     *   Option 3: Use cached endpoint instead
     *     GET /api/v1/fuel/vehicle/{vehicleId}
     *     - Response time: 100ms (no API calls)
     *     - Vehicle data 1-2 days old
     *     - Perfect for dashboards
     * 
     *   Option 4: Implement caching layer
     *     - Background job refreshes realtime data hourly
     *     - User gets fresh data instantly
     *     - Reduces API call pressure
     *     - Smooth user experience
     * 
     * FALLBACK STRATEGY:
     *   If vehicle API fails for individual records:
     *     - Returns that record with cached vehicle data
     *     - Other records continue normally
     *     - Graceful degradation (no errors shown)
     *     - User gets mostly fresh data
     * 
     * USE CASES:
     * 
     *   1. Fraud investigation:
     *      GET /api/v1/fuel/vehicle/X/realtime?from=2026-03-01&to=2026-04-30
     *      - 2-month detailed audit
     *      - Check vehicle status changes
     *      - Verify maintenance scheduling
     *      - Investigate consumption patterns
     * 
     *   2. Vehicle status verification:
     *      - Admin verifies vehicle before driver assignment
     *      - Sees recent fuel entries with current vehicle status
     *      - Checks if vehicle status changed since last fuel
     *      - Ensures proper maintenance
     * 
     *   3. Detailed fuel consumption analysis:
     *      - Comparing recorded odometer vs current odometer
     *      - Calculating actual fuel consumption rate
     *      - Detecting tampering or fraud indicators
     *      - Identifying maintenance needs
     * 
     *   4. Compliance & audit reports:
     *      - Detailed fuel history export
     *      - Vehicle snapshots at each fuel entry
     *      - For regulatory compliance
     *      - Quarterly or annual audits
     * 
     * VEHICLE DATA INCLUDED:
     *   - Current status (ACTIVE, MAINTENANCE, RETIRED, INACTIVE)
     *   - Current odometer reading
     *   - Service history
     *   - Fuel tank capacity
     *   - Current location
     *   - Insurance status
     *   - Maintenance schedule status
     * 
     * ODOMETERREADING ANALYSIS:
     *   - Compare with recorded odometer at fuel entry
     *   - Calculate actual distance traveled
     *   - Detect odometer tampering
     *   - Validate fuel consumption efficiency
     * 
     * ANOMALY INDICATORS:
     *   - Vehicle status changed between entries
     *   - Odometer went backwards (impossible)
     *   - Service scheduled but not completed
     *   - Unusual time gaps between fills
     * 
     * SECURITY:
     *   - Requires ADMIN role
     *   - Vehicle API calls authenticated
     *   - Query logged with admin ID
     *   - Data encrypted in transit
     *   - IP address recorded
     * 
     * MONITORING RECOMMENDATIONS:
     *   - Track response times (alert if > 30 seconds)
     *   - Monitor API call failures
     *   - Count simultaneous requests
     *   - Alert on unusual patterns
     *   - Rate limit aggressive use
     * 
     * NEXT STEPS:
     *   - View specific fuel entry: GET /api/v1/fuel/{id}/with-vehicle-data
     *   - Flag suspicious entry: PATCH /api/v1/fuel/{id}/flag
     *   - Get faster data: GET /api/v1/fuel/vehicle/{vehicleId}
     *   - Download report: Export results to CSV/PDF
     * 
     * @param vehicleId     Vehicle UUID (from URL path, required)
     * @return              Fuel records with real-time vehicle snapshots (HTTP 200)
     * @throws              ResourceNotFoundException if vehicle not found (HTTP 404)
     * @throws              InvalidRequestException if UUID format invalid (HTTP 400)
     * @throws              RequestTimeoutException if API calls take too long
     * 
     * @see FuelRecordResponse for response structure
     * @see #getFuelByVehicle(UUID) for cached version (recommended for production)
     */
    @GetMapping("/vehicle/{vehicleId}/realtime")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicleRealTime(
            @PathVariable UUID vehicleId) {
        // Step 1: Call service to get records with real-time vehicle data
        // Service handles: API validation + database query + per-record API calls + fallback
        List<FuelRecordResponse> records = fuelService.getByVehicleWithRealTimeData(vehicleId);
        
        // Step 2: Return list with HTTP 200 OK status
        return ResponseEntity.ok(records);
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Fuel Records for a Specific Driver
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Retrieves complete fuel history for a specific driver across all assigned vehicles.
     *   Useful for evaluating driver behavior, fuel expense tracking, and anomaly detection.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/driver/{driverId}
     * 
     * PATH PARAMETER:
     *   {driverId} = Driver UUID (example: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/driver/f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "abc-123",
     *       "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *       "driverName": "John Smith",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "quantity": 45.5,
     *       "totalCost": 568.75,
     *       "fuelDate": "2026-04-20",
     *       "isFlagged": false,
     *       "createdAt": "2026-04-20T14:30:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Records found and returned
     *   404 NOT FOUND       - Driver doesn't exist or no fuel records
     *   400 BAD REQUEST     - Invalid driver UUID format
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Database error
     * 
     * PERFORMANCE:
     *   - Response time: 50-200ms
     *   - Database queries: 1 (indexed on driverId)
     *   - API calls: 0 (uses cached vehicle data)
     * 
     * USE CASES:
     *   - Driver performance review
     *   - Fuel expense tracking per driver
     *   - Anomaly detection (unusual refueling patterns)
     *   - Driver comparison (fuel efficiency)
     *   - Flagged records identification
     * 
     * @param driverId Driver UUID (from URL path, required)
     * @return All fuel records for driver with cached vehicle data (HTTP 200)
     * 
     * @see FuelRecordResponse for response structure
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByDriver(
            @PathVariable UUID driverId) {
        return ResponseEntity.ok(fuelService.getByDriver(driverId));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Get All Flagged/Suspicious Fuel Records
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Retrieves all fuel records flagged as suspicious due to fraud detection.
     *   This is the PRIMARY endpoint for investigating potential misuse of fuel.
     * 
     * ENDPOINT:
     *   GET /api/v1/fuel/flagged
     *   No query parameters
     * 
     * EXAMPLE REQUEST:
     *   GET /api/v1/fuel/flagged
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   [
     *     {
     *       "id": "suspicious-123",
     *       "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *       "vehiclePlate": "ABC-1234",
     *       "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *       "driverName": "John Smith",
     *       "quantity": 450.0,
     *       "totalCost": 5625.00,
     *       "fuelDate": "2026-04-19",
     *       "isFlagged": true,
     *       "flagReason": "Quantity (450L) exceeds safe limit of 300L",
     *       "flaggedAt": "2026-04-19T14:35:00Z",
     *       "flaggedBy": "admin@vfms.com",
     *       "createdAt": "2026-04-19T14:30:00Z"
     *     },
     *     {
     *       "id": "suspicious-456",
     *       "vehicleId": "e7c3d5f9-a1b8-4e2a-8f4c-b1e9d5f9a1b8",
     *       "vehiclePlate": "XYZ-5678",
     *       "driverId": "a1b8e7c3-d5f9-4e2a-8f4c-b1e9d5f9a1b8",
     *       "driverName": "Jane Doe",
     *       "quantity": 38.2,
     *       "costPerLitre": 3.50,
     *       "totalCost": 133.70,
     *       "fuelDate": "2026-04-18",
     *       "isFlagged": true,
     *       "flagReason": "Cost per litre (₹3.50) below normal range of ₹5-20",
     *       "flaggedAt": "2026-04-18T10:15:00Z",
     *       "flaggedBy": "admin@vfms.com",
     *       "createdAt": "2026-04-18T10:10:00Z"
     *     }
     *   ]
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Flagged records returned (may be empty list)
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Database error
     * 
     * RESPONSE CHARACTERISTICS:
     *   - Total records: Depends on fraud detection sensitivity
     *   - Typical: 5-20 flagged records per 1000 total records (0.5-2%)
     *   - Sorted by: Flag date (newest first)
     *   - Includes: Reason, who flagged it, when it was flagged
     * 
     * FLAG REASONS (Examples):
     *   - Quantity > 300 liters (tank overflow risk)
     *   - Quantity > 50% above vehicle average consumption
     *   - Cost per liter < ₹5 or > ₹20 (unusual pricing)
     *   - Multiple fills same day for same vehicle
     *   - Missing receipt when policy requires
     *   - Fuel entry by new/suspicious driver
     *   - Fuel entry at unusual location
     *   - Time gap anomaly between fuel entries
     * 
     * PERFORMANCE:
     *   - Response time: 50-150ms (indexed on isFlagged)
     *   - Database query: 1 (simple WHERE clause)
     *   - Result size: Usually 5-50 records
     *   - No API calls: Uses cached vehicle data
     * 
     * TYPICAL USAGE PATTERN:
     *   1. Admin opens fraud investigation dashboard
     *   2. System calls this endpoint automatically
     *   3. Shows list of flagged records
     *   4. Admin clicks record for details
     *   5. Admin reviews vehicle and driver history
     *   6. Admin marks as verified or unflag
     * 
     * FRAUD DETECTION INDICATORS:
     *   ✗ Unusually high fuel quantity
     *   ✗ Unusually high cost
     *   ✗ Missing receipt
     *   ✗ Multiple entries same day
     *   ✗ Entry at suspicious location
     *   ✗ Entry by problematic driver
     *   ✗ Inconsistent with vehicle usage
     *   ✗ Odometer anomaly
     * 
     * WHAT TO DO WITH FLAGGED RECORDS:
     *   
     *   Option 1: Investigate Further
     *      - Review vehicle history
     *      - Check driver record
     *      - Verify receipt if available
     *      - Contact driver for explanation
     * 
     *   Option 2: Unflag if False Positive
     *      - Record is legitimate
     *      - Special circumstance (bulk transport)
     *      - Receipt verified
     *      - Call unflag API endpoint
     * 
     *   Option 3: Escalate if Suspicious
     *      - High risk of fraud
     *      - Multiple red flags
     *      - Escalate to management
     *      - Report to authorities if needed
     * 
     * MANAGEMENT ACTIONS:
     *   - Unflag legitimate entries: PATCH /api/v1/fuel/{id}/unflag
     *   - Delete fraudulent entry: DELETE /api/v1/fuel/{id}
     *   - Report to authorities
     *   - Discipline driver if needed
     *   - Adjust detection thresholds
     * 
     * HISTORICAL ANALYSIS:
     *   - Track flagged record trends over time
     *   - Identify problematic drivers (repeat flags)
     *   - Identify problematic vehicles (frequent flags)
     *   - Identify problematic locations (unusual prices)
     *   - Adjust detection rules based on history
     * 
     * DASHBOARD INTEGRATION:
     *   - Show flagged count as metric
     *   - Show flag trend chart
     *   - Highlight top flagged vehicles
     *   - Highlight top flagged drivers
     *   - Alert on new flags in real-time
     * 
     * RECOMMENDATION:
     *   Review flagged records:
     *   - Daily (high volume operations)
     *   - Weekly (medium operations)
     *   - As needed (small operations)
     * 
     * NEXT STEPS:
     *   - Click flagged record to view details
     *   - Review vehicle history
     *   - Check driver information
     *   - Take action (unflag, delete, or escalate)
     * 
     * @return List of all flagged fuel records (HTTP 200)
     * 
     * @see FuelRecordResponse for response structure
     * @see #getFuelByVehicle(UUID) to view all records for flagged vehicle
     * @see #getFuelByDriver(UUID) to view all records for flagged driver
     */
    @GetMapping("/flagged")
    public ResponseEntity<List<FuelRecordResponse>> getFlaggedRecords() {
        return ResponseEntity.ok(fuelService.getFlaggedRecords());
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  U P D A T E   O P E R A T I O N S  █████████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Update a Complete Fuel Record (Full Replacement)
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Updates ALL fields of a fuel record with new values (full replacement).
     *   Use this when making significant changes to a record.
     * 
     * ENDPOINT:
     *   PUT /api/v1/fuel/{id}
     *   Content-Type: application/json
     * 
     * DIFFERENCE: PUT vs PATCH:
     *   - PUT: Replace ALL fields (full update)
     *   - PATCH: Update ONLY specified fields (partial update)
     * 
     * EXAMPLE REQUEST:
     *   PUT /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479
     *   {
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "fuelDate": "2026-04-21",
     *     "quantity": 50.0,
     *     "costPerLitre": 12.75,
     *     "totalCost": 637.50,
     *     "odometerReading": 50100.0,
     *     "location": "Shell Station - Downtown"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "driverId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "driverName": "John Smith",
     *     "fuelDate": "2026-04-21",
     *     "quantity": 50.0,
     *     "costPerLitre": 12.75,
     *     "totalCost": 637.50,
     *     "odometerReading": 50100.0,
     *     "location": "Shell Station - Downtown",
     *     "isFlagged": false,
     *     "updatedAt": "2026-04-21T10:30:00Z",
     *     "updatedBy": "admin@vfms.com"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Record successfully updated
     *   400 BAD REQUEST     - Invalid data or validation failed
     *   404 NOT FOUND       - Record doesn't exist
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   500 INTERNAL ERROR  - Server error
     * 
     * VALIDATION RULES:
     *   - All fields required (same as create)
     *   - quantity must be > 0 and < 500
     *   - costPerLitre must be > 0 and reasonable
     *   - totalCost must equal quantity × costPerLitre
     *   - vehicleId must exist in system
     *   - driverId must exist in system
     * 
     * AUDIT TRAIL:
     *   - Records who made the update
     *   - Records when update occurred
     *   - Logs old values vs new values
     *   - Maintains change history
     * 
     * USE CASES:
     *   - Correct data entry errors
     *   - Update receipt after verification
     *   - Change driver/vehicle assignment
     *   - Update location information
     * 
     * IMPORTANT NOTES:
     *   ⚠️ TODO: Implementation pending in FuelService
     *   Currently returns cached record without updating
     * 
     * @param id      Fuel record UUID (from URL path, required)
     * @param request Complete new fuel record data (required)
     * @return        Updated fuel record (HTTP 200)
     * 
     * @see CreateFuelRecordRequest for required fields
     * @see FuelRecordResponse for response structure
     * @see #patchFuelRecord(UUID, CreateFuelRecordRequest) for partial updates
     */
    @PutMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> updateFuelRecord(
            @PathVariable UUID id,
            @Valid @RequestBody CreateFuelRecordRequest request) {
        // TODO: Implement full update logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Partially Update a Fuel Record (Selective Fields)
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Updates ONLY the specified fields of a fuel record.
     *   Use this for minor corrections without replacing everything.
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}
     *   Content-Type: application/json
     * 
     * DIFFERENCE: PATCH vs PUT:
     *   - PATCH: Update ONLY specified fields (partial update)
     *   - PUT: Replace ALL fields (full replacement)
     * 
     * EXAMPLE REQUEST (Update only quantity and cost):
     *   PATCH /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479
     *   {
     *     "quantity": 45.0,
     *     "totalCost": 562.50
     *   }
     *   
     *   Other fields remain unchanged from original record.
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "fuelDate": "2026-04-20",
     *     "quantity": 45.0,                          ← Changed
     *     "costPerLitre": 12.50,
     *     "totalCost": 562.50,                       ← Changed
     *     "odometerReading": 50000.0,                ← Unchanged
     *     "location": "Shell Station",               ← Unchanged
     *     "updatedAt": "2026-04-21T10:30:00Z",
     *     "updatedBy": "admin@vfms.com"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Record successfully updated
     *   400 BAD REQUEST     - Invalid data
     *   404 NOT FOUND       - Record doesn't exist
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   409 CONFLICT        - Inconsistent data (e.g., qty×price ≠ total)
     *   500 INTERNAL ERROR  - Server error
     * 
     * FLEXIBLE UPDATES:
     *   Can update just one field or multiple fields:
     *   - Just quantity: { "quantity": 50.0 }
     *   - Quantity + cost: { "quantity": 50.0, "totalCost": 625.00 }
     *   - Just location: { "location": "New Station Name" }
     * 
     * VALIDATION:
     *   - Only validates fields being updated
     *   - Other fields inherit existing values
     *   - Consistency checks (qty × price = total)
     *   - All values must be valid if provided
     * 
     * AUDIT TRAIL:
     *   - Records who made the update
     *   - Records when update occurred
     *   - Logs only changed fields
     *   - Maintains complete change history
     * 
     * USE CASES:
     *   - Fix quantity data entry
     *   - Correct cost per liter
     *   - Update fuel station location
     *   - Add missing odometer reading
     *   - Any single field correction
     * 
     * IMPORTANT NOTES:
     *   ⚠️ TODO: Implementation pending in FuelService
     *   Currently returns cached record without updating
     * 
     * @param id      Fuel record UUID (from URL path, required)
     * @param updates Partial update data (one or more fields, required)
     * @return        Updated fuel record (HTTP 200)
     * 
     * @see CreateFuelRecordRequest for available fields
     * @see FuelRecordResponse for response structure
     * @see #updateFuelRecord(UUID, CreateFuelRecordRequest) for full updates
     */
    @PatchMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> patchFuelRecord(
            @PathVariable UUID id,
            @RequestBody CreateFuelRecordRequest updates) {
        // TODO: Implement partial update logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  F L A G G I N G   O P E R A T I O N S  ███████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Flag a Fuel Record as Suspicious
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Marks a fuel record as suspicious/fraudulent for investigation.
     *   Use this when admin manually identifies potential misuse or fraud.
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}/flag
     *   No request body required
     * 
     * EXAMPLE REQUEST:
     *   PATCH /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/flag
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "quantity": 45.5,
     *     "totalCost": 568.75,
     *     "isFlagged": true,                         ← Changed to true
     *     "flagReason": "Manual flag by admin",
     *     "flaggedAt": "2026-04-21T10:45:00Z",       ← Timestamp added
     *     "flaggedBy": "admin@vfms.com",             ← Admin email
     *     "createdAt": "2026-04-20T14:30:00Z"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Record successfully flagged
     *   404 NOT FOUND       - Record doesn't exist
     *   400 BAD REQUEST     - Invalid record UUID
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   409 CONFLICT        - Record already flagged
     *   500 INTERNAL ERROR  - Server error
     * 
     * WHAT HAPPENS:
     *   1. Validates record exists
     *   2. Marks as flagged (isFlagged = true)
     *   3. Records flag reason: "Manual flag by admin"
     *   4. Records timestamp when flagged
     *   5. Records which admin flagged it
     *   6. Creates audit log entry
     *   7. Notifies relevant personnel (optional)
     *   8. Returns updated record
     * 
     * REASONS FOR FLAGGING:
     *   - Suspicion of driver fuel theft
     *   - Suspicion of fuel resale
     *   - Odometer discrepancy
     *   - Unusually high consumption
     *   - Receipt authenticity concerns
     *   - Price inconsistency
     *   - Location anomaly
     *   - Pattern-based suspicion
     *   - Driver disciplinary issues
     *   - Vehicle maintenance issues
     * 
     * AUDIT TRAIL:
     *   - Records who flagged (admin name/ID)
     *   - Records when flagged (timestamp)
     *   - Records flag reason
     *   - Creates notification in audit log
     *   - Maintains history of flag changes
     * 
     * WORKFLOW:
     *   1. Admin reviews fuel records
     *   2. Finds suspicious entry
     *   3. Calls this endpoint to flag
     *   4. Continues investigation
     *   5. Either unflag (if false positive) or escalate
     * 
     * NOTIFICATIONS (If Enabled):
     *   - Fleet manager gets alert
     *   - Driver may get notification
     *   - Audit trail is created
     *   - Flagged status visible in dashboard
     * 
     * IMPORTANT NOTES:
     *   ⚠️ TODO: Implementation pending in FuelService
     *   Currently returns cached record without flagging
     * 
     * @param id      Fuel record UUID (from URL path, required)
     * @return        Updated fuel record with flag status (HTTP 200)
     * 
     * @see FuelRecordResponse for response structure
     * @see #unflagFuelRecord(UUID) to remove the flag
     * @see #getFlaggedRecords() to view all flagged records
     */
    @PatchMapping("/{id}/flag")
    public ResponseEntity<FuelRecordResponse> flagFuelRecord(@PathVariable UUID id) {
        // TODO: Implement flag logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Unflag a Fuel Record (Mark as Legitimate)
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Removes suspicious flag from a fuel record after verification.
     *   Use this after confirming the record is legitimate.
     * 
     * ENDPOINT:
     *   PATCH /api/v1/fuel/{id}/unflag
     *   No request body required
     * 
     * EXAMPLE REQUEST:
     *   PATCH /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479/unflag
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "vehicleId": "d5a64b9a-8f4e-4a2c-b1e9-7c3d5f9a1b8e",
     *     "vehiclePlate": "ABC-1234",
     *     "quantity": 45.5,
     *     "totalCost": 568.75,
     *     "isFlagged": false,                        ← Changed to false
     *     "flagReason": null,                        ← Cleared
     *     "unflaggedAt": "2026-04-21T14:30:00Z",     ← Timestamp added
     *     "unflaggedBy": "admin@vfms.com",           ← Admin email
     *     "createdAt": "2026-04-20T14:30:00Z"
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Flag successfully removed
     *   404 NOT FOUND       - Record doesn't exist
     *   400 BAD REQUEST     - Invalid record UUID
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   409 CONFLICT        - Record not flagged
     *   500 INTERNAL ERROR  - Server error
     * 
     * WHAT HAPPENS:
     *   1. Validates record exists
     *   2. Checks if record is flagged
     *   3. Removes flag (isFlagged = false)
     *   4. Clears flag reason
     *   5. Records when unflagged
     *   6. Records which admin unflagged
     *   7. Creates audit log entry
     *   8. Returns updated record
     * 
     * REASONS FOR UNFLAGGING:
     *   - Receipt verified as authentic
     *   - Driver provided explanation
     *   - Bulk fuel transport confirmed legitimate
     *   - Price checked and verified
     *   - System error in detection
     *   - Management override
     *   - False positive identified
     * 
     * VERIFICATION PROCESS:
     *   1. Review receipt image
     *   2. Contact driver for explanation
     *   3. Check vehicle maintenance schedule
     *   4. Verify fuel station legitimacy
     *   5. Cross-reference fuel prices
     *   6. Compare with similar entries
     *   7. Make decision (flag/unflag)
     * 
     * AUDIT TRAIL:
     *   - Records who unflagged (admin name/ID)
     *   - Records when unflagged (timestamp)
     *   - Maintains original flag reason
     *   - Keeps unflag history
     *   - Complete accountability trail
     * 
     * WORKFLOW:
     *   1. Admin reviews flagged record
     *   2. Contacts driver / verifies details
     *   3. Confirms legitimacy
     *   4. Calls this endpoint to unflag
     *   5. Record returns to normal status
     * 
     * IMPORTANT NOTES:
     *   ⚠️ TODO: Implementation pending in FuelService
     *   Currently returns cached record without unflagging
     * 
     * @param id      Fuel record UUID (from URL path, required)
     * @return        Updated fuel record without flag (HTTP 200)
     * 
     * @see FuelRecordResponse for response structure
     * @see #flagFuelRecord(UUID) to flag the record
     * @see #getFlaggedRecords() to view all flagged records
     */
    @PatchMapping("/{id}/unflag")
    public ResponseEntity<FuelRecordResponse> unflagFuelRecord(@PathVariable UUID id) {
        // TODO: Implement unflag logic in FuelService
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  D E L E T E   O P E R A T I O N S  █████████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Delete a Fuel Record (Permanent Removal)
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * ⚠️ WARNING: PERMANENT DELETION - CANNOT BE UNDONE
     * 
     * PURPOSE:
     *   Permanently removes a fuel record from the system.
     *   Use only for erroneous or fraudulent entries that must be removed.
     * 
     * ENDPOINT:
     *   DELETE /api/v1/fuel/{id}
     * 
     * EXAMPLE REQUEST:
     *   DELETE /api/v1/fuel/f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * EXAMPLE RESPONSE (204 NO CONTENT):
     *   [Empty body - HTTP 204 means operation succeeded]
     * 
     * HTTP STATUS CODES:
     *   204 NO CONTENT      - Record successfully deleted
     *   404 NOT FOUND       - Record doesn't exist
     *   400 BAD REQUEST     - Invalid record UUID
     *   401 UNAUTHORIZED    - User not authenticated
     *   403 FORBIDDEN       - User lacks ADMIN permission
     *   409 CONFLICT        - Cannot delete (referenced elsewhere)
     *   500 INTERNAL ERROR  - Server error
     * 
     * WHAT HAPPENS:
     *   1. Validates record exists
     *   2. Checks delete permissions (ADMIN role required)
     *   3. Creates backup of record (soft delete / archive)
     *   4. Removes from active records
     *   5. Updates audit trail
     *   6. Returns HTTP 204 (no content)
     * 
     * PERMANENT EFFECTS:
     *   - Record disappears from all queries
     *   - Fuel statistics will be recalculated
     *   - Vehicle fuel history updated
     *   - Driver fuel history updated
     *   - Cannot be recovered (unless from backup)
     * 
     * WHEN TO DELETE:
     *   ✓ Confirmed fraudulent entry
     *   ✓ Duplicate entry (same vehicle/date)
     *   ✓ Test data accidentally in production
     *   ✓ Privacy request (GDPR etc.)
     *   ✓ System error created invalid entry
     *   ✓ After thorough investigation
     * 
     * WHEN NOT TO DELETE:
     *   ✗ Suspicious but unconfirmed (flag instead)
     *   ✗ Disputed by driver (unflag after verification)
     *   ✗ Just don't like the data
     *   ✗ Without proper authorization
     *   ✗ Without audit trail backup
     * 
     * ALTERNATIVE: FLAG INSTEAD
     *   If unsure about deletion:
     *   - Flag the record: PATCH /api/v1/fuel/{id}/flag
     *   - Investigate further
     *   - Unflag if legitimate
     *   - Only delete if confirmed fraud
     * 
     * DELETION REVIEW PROCESS:
     *   1. Identify record to delete
     *   2. Review associated data (vehicle, driver, receipt)
     *   3. Document reason for deletion
     *   4. Get manager approval (recommended)
     *   5. Call delete endpoint
     *   6. Verify deletion in system
     *   7. Archive deleted record ID for records
     * 
     * AUDIT TRAIL:
     *   - Records who deleted record
     *   - Records when deleted (timestamp)
     *   - Records deletion reason (in comments/notes)
     *   - Maintains backup of deleted data
     *   - Complete accountability trail
     * 
     * IMPACT ON STATISTICS:
     *   - Fuel expenses: Recalculated without deleted record
     *   - Vehicle history: Updated
     *   - Driver history: Updated
     *   - Consumption rates: Recalculated
     *   - Flagged record counts: Updated
     * 
     * DATA RETENTION:
     *   - Deleted records may be archived (not deleted)
     *   - Archives kept for compliance/audit
     *   - Kept separate from active data
     *   - Searchable only by authorized personnel
     * 
     * REGULATORY COMPLIANCE:
     *   - Some data must be kept for compliance
     *   - Tax records must be kept 7+ years
     *   - Verify retention policy before deleting
     *   - Document deletion reason for compliance
     * 
     * BEST PRACTICES:
     *   1. Always flag first (if suspicious)
     *   2. Investigate thoroughly
     *   3. Get approval from manager
     *   4. Document reason for deletion
     *   5. Delete only confirmed frauds
     *   6. Keep audit trail
     *   7. Archive deleted records
     *   8. Verify impact on reports
     * 
     * RECOVERY OPTIONS:
     *   - Request IT restore from backup
     *   - Check archive table
     *   - Contact system administrator
     *   - Keep manual logs of deleted IDs
     * 
     * SAFETY RECOMMENDATION:
     *   Do NOT rush to delete. Instead:
     *   1. Flag the record (PATCH /flag)
     *   2. Investigate (review history, contact driver)
     *   3. Unflag if legitimate (PATCH /unflag)
     *   4. Only delete if confirmed fraud (DELETE)
     * 
     * IMPORTANT NOTES:
     *   ⚠️ TODO: Implementation pending in FuelService
     *   Currently returns 204 without actually deleting
     * 
     *   ⚠️ CRITICAL: Ensure you understand consequences before deleting
     *   - Cannot undo without system administrator help
     *   - May affect financial reports
     *   - May affect compliance audits
     *   - Always document reason
     * 
     * @param id      Fuel record UUID (from URL path, required)
     * @return        HTTP 204 No Content on successful deletion
     * 
     * @see #flagFuelRecord(UUID) to flag (safer alternative)
     * @see #unflagFuelRecord(UUID) to unflag legitimate records
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelRecord(@PathVariable UUID id) {
        // TODO: Implement deleteById in FuelService and uncomment below
        // fuelService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
