<<<<<<< HEAD
package com.vfms.fuel;

/**
 * Fuel Management API – Reference Documentation
 *
 * <p><b>Base Path:</b> {@code /api/v1/fuel}</p>
 *
 * <h2>Overview</h2>
 * <p>This module handles fuel record management with real-time vehicle data
 * fetching from the vehicle API endpoint. All fuel records are stored in
 * Supabase PostgreSQL with relationships to vehicles for data consistency.</p>
 *
 * <h2>CREATE Operations</h2>
 * <ul>
 *   <li><b>POST /api/v1/fuel</b> – Create a new fuel record (multipart/form-data).
 *       Validates vehicle in real-time, calculates total cost, optionally uploads
 *       a receipt, checks for misuse, and updates the vehicle odometer.</li>
 * </ul>
 *
 * <h2>READ Operations</h2>
 * <ul>
 *   <li><b>GET /api/v1/fuel</b> – All records (cached vehicle data).</li>
 *   <li><b>GET /api/v1/fuel/{id}</b> – Single record by ID.</li>
 *   <li><b>GET /api/v1/fuel/{id}/with-vehicle-data</b> – Single record with
 *       real-time vehicle data from the vehicle API.</li>
 *   <li><b>GET /api/v1/fuel/realtime/all</b> – All records with real-time data.
 *       <em>Warning: makes one API call per record; use only for small sets.</em></li>
 *   <li><b>GET /api/v1/fuel/vehicle/{vehicleId}</b> – Records for a vehicle (cached).</li>
 *   <li><b>GET /api/v1/fuel/vehicle/{vehicleId}/realtime</b> – Records for a vehicle
 *       with real-time data.</li>
 *   <li><b>GET /api/v1/fuel/driver/{driverId}</b> – Records for a driver.</li>
 *   <li><b>GET /api/v1/fuel/flagged</b> – All records flagged for misuse.</li>
 *   <li><b>GET /api/v1/fuel/search</b> – Filtered by date range and optional
 *       {@code vehicleId} / {@code driverId}.</li>
 * </ul>
 *
 * <h2>UPDATE Operations</h2>
 * <ul>
 *   <li><b>PUT  /api/v1/fuel/{id}</b> – Full update (all fields required).</li>
 *   <li><b>PATCH /api/v1/fuel/{id}</b> – Partial update (only changed fields needed).</li>
 * </ul>
 *
 * <h2>Flagging Operations</h2>
 * <ul>
 *   <li><b>PATCH /api/v1/fuel/{id}/flag</b>   – Manually mark a record as suspicious.</li>
 *   <li><b>PATCH /api/v1/fuel/{id}/unflag</b> – Clear the misuse flag from a record.</li>
 * </ul>
 *
 * <h2>DELETE Operations</h2>
 * <ul>
 *   <li><b>DELETE /api/v1/fuel/{id}</b> – Remove a fuel record permanently.</li>
 * </ul>
 *
 * <h2>Misuse Detection Rules</h2>
 * <p>Records are auto-flagged when any of the following conditions are met:</p>
 * <ol>
 *   <li>Quantity exceeds {@code fuel.misuse.max-litres-per-entry} (default: 100 L).</li>
 *   <li>Daily entry count for the same vehicle exceeds
 *       {@code fuel.misuse.max-entries-per-day} (default: 3).</li>
 *   <li>Odometer reading is lower than the previous recorded reading.</li>
 * </ol>
 *
 * <h2>Real-Time vs Cached Data</h2>
 * <ul>
 *   <li><b>Cached</b> (default) – reads the {@code vehicles} table; fast,
 *       best for lists and analytics.</li>
 *   <li><b>Real-Time</b> ({@code /realtime} endpoints) – makes an HTTP call to
 *       the vehicle service; guaranteed current, best for single-record detail views.
 *       Falls back to cached data gracefully if the vehicle API is unavailable.</li>
 * </ul>
 *
 * <h2>Error Response Format</h2>
 * <pre>
 * {
 *   "status":    404,
 *   "message":   "Fuel record not found",
 *   "timestamp": "2026-04-22T10:30:00"
 * }
 * </pre>
 *
 * @see com.vfms.fuel.controller.FuelController
 * @see com.vfms.fuel.service.FuelService
 * @see com.vfms.fuel.service.FuelMisuseService
 */
final class FuelApiDocumentation {

    /** Prevent instantiation – this is a documentation-only class. */
    private FuelApiDocumentation() {
    }
}
=======
/**
 * FUEL MANAGEMENT API ENDPOINTS - Real-time Vehicle Data Integration
 * 
 * BASE PATH: /api/v1/fuel
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * OVERVIEW
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This module handles fuel record management with real-time vehicle data 
 * fetching from the vehicle API endpoint. All fuel records are stored in 
 * Supabase PostgreSQL with relationships to vehicles for data consistency.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 1. POST /api/v1/fuel
 *    Description: Create a new fuel record with optional receipt
 *    
 *    Request:
 *    - Content-Type: multipart/form-data
 *    - Parts:
 *      * data (JSON): CreateFuelRecordRequest
 *      * receipt (File): Optional receipt image/PDF
 *    
 *    RequestBody Example:
 *    {
 *      "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
 *      "driverId": "550e8400-e29b-41d4-a716-446655440001",
 *      "fuelDate": "2026-04-22",
 *      "quantity": 45.5,
 *      "costPerLitre": 85.50,
 *      "odometerReading": 12500.5,
 *      "fuelStation": "Shell Station #5",
 *      "notes": "Filled at metro station"
 *    }
 *    
 *    Features:
 *    - Real-time vehicle validation against vehicle endpoint
 *    - Automatic cost calculation (quantity × costPerLitre)
 *    - Receipt upload to Supabase Storage (optional)
 *    - Automatic misuse detection
 *    - Odometer reading update on vehicle
 *    
 *    Response: 201 Created
 *    {
 *      "id": "650e8400-e29b-41d4-a716-446655440000",
 *      "vehicleId": "550e8400-e29b-41d4-a716-446655440000",
 *      "vehiclePlate": "DL01AB1234",
 *      "vehicleMakeModel": "Tata Nexon Ev",
 *      "fuelDate": "2026-04-22",
 *      "quantity": 45.50,
 *      "costPerLitre": 85.50,
 *      "totalCost": 3890.75,
 *      "odometerReading": 12500.5,
 *      "fuelStation": "Shell Station #5",
 *      "receiptUrl": "https://supabase.../fuel-receipts/...",
 *      "flaggedForMisuse": false,
 *      "createdAt": "2026-04-22T10:30:00"
 *    }
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * READ OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 2. GET /api/v1/fuel
 *    Description: Get all fuel records (cached data)
 *    Response: 200 OK - Array of FuelRecordResponse
 * 
 * 3. GET /api/v1/fuel/{id}
 *    Description: Get specific fuel record by ID
 *    Path Parameter: id (UUID) - Fuel record ID
 *    Response: 200 OK - FuelRecordResponse
 * 
 * 4. GET /api/v1/fuel/{id}/with-vehicle-data
 *    Description: Get fuel record with REAL-TIME vehicle data
 *    Path Parameter: id (UUID) - Fuel record ID
 *    
 *    Features:
 *    - Fetches latest vehicle status from vehicle endpoint
 *    - Includes current vehicle odometer, fuel level, etc.
 *    - Useful for detailed fuel analysis
 *    
 *    Response: 200 OK - FuelRecordResponse with current vehicle data
 * 
 * 5. GET /api/v1/fuel/realtime/all
 *    Description: Get all fuel records with REAL-TIME vehicle data
 *    
 *    ⚠️  WARNING: High API call volume - Use with caution in production
 *    This endpoint makes one API call per fuel record to vehicle endpoint.
 *    For large datasets, consider using pagination or caching.
 *    
 *    Response: 200 OK - Array of FuelRecordResponse with real-time data
 * 
 * 6. GET /api/v1/fuel/vehicle/{vehicleId}
 *    Description: Get all fuel records for a vehicle (cached data)
 *    Path Parameter: vehicleId (UUID) - Vehicle ID
 *    Response: 200 OK - Array of FuelRecordResponse
 * 
 * 7. GET /api/v1/fuel/vehicle/{vehicleId}/realtime
 *    Description: Get all fuel records for a vehicle with REAL-TIME data
 *    Path Parameter: vehicleId (UUID) - Vehicle ID
 *    
 *    Features:
 *    - Validates vehicle exists in real-time
 *    - Fetches latest vehicle data from endpoint
 *    - Shows complete fuel history with current vehicle status
 *    
 *    Response: 200 OK - Array of FuelRecordResponse with real-time data
 * 
 * 8. GET /api/v1/fuel/driver/{driverId}
 *    Description: Get all fuel records for a driver
 *    Path Parameter: driverId (UUID) - Driver ID
 *    Response: 200 OK - Array of FuelRecordResponse
 * 
 * 9. GET /api/v1/fuel/flagged
 *    Description: Get all fuel records flagged for misuse
 *    Response: 200 OK - Array of flagged FuelRecordResponse
 * 
 * 10. GET /api/v1/fuel/search
 *     Description: Search fuel records with filters
 *     Query Parameters:
 *     - from (String): Start date (YYYY-MM-DD) - Required
 *     - to (String): End date (YYYY-MM-DD) - Required
 *     - vehicleId (UUID): Optional - Filter by vehicle
 *     - driverId (UUID): Optional - Filter by driver
 *     
 *     Example: /api/v1/fuel/search?from=2026-04-01&to=2026-04-30&vehicleId=550e8400-...
 *     Response: 200 OK - Array of FuelRecordResponse
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * UPDATE OPERATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 11. PUT /api/v1/fuel/{id}
 *     Description: Update a fuel record
 *     Path Parameter: id (UUID) - Fuel record ID
 *     RequestBody: CreateFuelRecordRequest (all fields)
 *     Response: 200 OK - Updated FuelRecordResponse
 *     Note: Full update - provide all fields
 * 
 * 12. PATCH /api/v1/fuel/{id}
 *     Description: Partially update a fuel record
 *     Path Parameter: id (UUID) - Fuel record ID
 *     RequestBody: Partial CreateFuelRecordRequest
 *     Response: 200 OK - Updated FuelRecordResponse
 *     Note: Partial update - only updated fields needed
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * FLAGGING OPERATIONS (Misuse Detection)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 13. PATCH /api/v1/fuel/{id}/flag
 *     Description: Manually flag a fuel record as suspicious
 *     Path Parameter: id (UUID) - Fuel record ID
 *     Response: 200 OK - Flagged FuelRecordResponse
 * 
 * 14. PATCH /api/v1/fuel/{id}/unflag
 *     Description: Remove misuse flag from a fuel record
 *     Path Parameter: id (UUID) - Fuel record ID
 *     Response: 200 OK - Unflagged FuelRecordResponse
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * MISUSE DETECTION LOGIC
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Fuel records are automatically flagged if they meet ANY of these criteria:
 * 
 * 1. Quantity Threshold: > 100 liters per single entry
 * 2. Frequency Threshold: > 3 entries per day for same vehicle
 * 3. Efficiency Alert: Abnormal fuel consumption pattern
 * 4. Manual Override: Admin can manually flag records
 * 
 * Threshold Configuration in application.properties:
 * fuel.misuse.max-litres-per-entry=100
 * fuel.misuse.max-entries-per-day=3
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * REAL-TIME DATA FETCHING
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * The fuel module fetches vehicle data in two ways:
 * 
 * 1. CACHED DATA (Default endpoints without /realtime suffix)
 *    - Uses Vehicle entity stored in database
 *    - Faster response times
 *    - Data may be slightly stale (from last update)
 *    - Recommended for lists and analytics
 *    
 * 2. REAL-TIME DATA (Endpoints with /realtime suffix or /with-vehicle-data)
 *    - Calls vehicle API endpoint for latest data
 *    - Guaranteed current information
 *    - Slightly slower (network latency)
 *    - Recommended for single record details
 *    
 * Vehicle API Integration:
 * - Base URL: http://localhost:8080/api/vehicles (configurable)
 * - Fetches: Vehicle ID, plate, make, model, year, status, odometer, fuel level
 * - Validation: Confirms vehicle exists before fuel record creation
 * - Error Handling: Graceful fallback to cached data if API unavailable
 * 
 * Configuration in application.properties:
 * app.vehicle.api.base-url=http://localhost:8080/api/vehicles
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE SCHEMA (Supabase PostgreSQL)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * fuel_records table:
 * - id (UUID, Primary Key)
 * - vehicle_id (UUID, Foreign Key → vehicles.id)
 * - driver_id (UUID, Foreign Key → drivers.id, Optional)
 * - fuel_date (DATE)
 * - quantity (DECIMAL 8,2) - in litres
 * - cost_per_litre (DECIMAL 8,2)
 * - total_cost (DECIMAL 10,2) - calculated automatically
 * - odometer_reading (DOUBLE)
 * - fuel_station (VARCHAR)
 * - notes (TEXT)
 * - receipt_url (VARCHAR) - Supabase Storage URL
 * - receipt_file_name (VARCHAR)
 * - flagged_for_misuse (BOOLEAN)
 * - flag_reason (TEXT)
 * - created_by (VARCHAR) - email of user who created
 * - created_at (TIMESTAMP)
 * - updated_at (TIMESTAMP)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * ERROR HANDLING
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Status Codes:
 * - 200 OK: Successful read/update operation
 * - 201 Created: Successful creation
 * - 400 Bad Request: Invalid input data
 * - 404 Not Found: Resource not found
 * - 409 Conflict: Data inconsistency
 * - 500 Internal Server Error: Server error or vehicle API unavailable
 * 
 * Error Response Format:
 * {
 *   "status": 404,
 *   "message": "Fuel record not found",
 *   "timestamp": "2026-04-22T10:30:00"
 * }
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * EXAMPLE WORKFLOWS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * WORKFLOW 1: Create Fuel Record
 * 1. POST /api/v1/fuel (with receipt file)
 * 2. System validates vehicle via vehicle API (real-time)
 * 3. System calculates total cost
 * 4. System uploads receipt to Supabase Storage
 * 5. System checks for misuse patterns
 * 6. System stores record in database
 * 7. System updates vehicle odometer
 * 8. Returns 201 with fuel record details
 * 
 * WORKFLOW 2: View Fuel History with Current Vehicle Status
 * 1. GET /api/v1/fuel/vehicle/{vehicleId}/realtime
 * 2. System fetches all fuel records for vehicle from database
 * 3. System calls vehicle API for latest vehicle status
 * 4. System enriches each fuel record with current vehicle data
 * 5. Returns array of records with real-time vehicle information
 * 
 * WORKFLOW 3: Detect and Handle Misuse
 * 1. Create fuel record (system auto-detects if flagged)
 * 2. OR manually: PATCH /api/v1/fuel/{id}/flag
 * 3. GET /api/v1/fuel/flagged to see all suspicious records
 * 4. Review details with PATCH /api/v1/fuel/{id}/unflag to clear
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
>>>>>>> origin/feature/user-management
