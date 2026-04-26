package com.vfms.fuel.client;

import com.vfms.fuel.dto.VehicleDetailDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
<<<<<<< HEAD
import com.vfms.common.exception.ResourceNotFoundException;
=======
>>>>>>> origin/feature/user-management
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VehicleApiClient - REST API Client for Vehicle Service Integration
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   Acts as a bridge between the fuel management module and the vehicle
 *   management system. This client makes HTTP calls to vehicle endpoints
 *   to fetch real-time vehicle data from Supabase.
 * 
 * WHY THIS EXISTS:
 *   - Vehicle management is owned by a separate team
 *   - Fuel module needs current vehicle data for validation and enrichment
 *   - Provides loose coupling between modules (REST API, not direct DB access)
 *   - Enables real-time data fetching while maintaining database as source of truth
 * 
 * KEY PATTERNS:
 *   1. All methods have error logging with log.error/log.warn/log.debug
 *   2. Returns data or throws RuntimeException on failure
 *   3. Methods are non-transactional (no database access, just HTTP calls)
 * 
 * EXAMPLE USAGE:
 *   // Check if vehicle exists before creating fuel record
 *   if (!vehicleApiClient.vehicleExists(vehicleId)) {
 *       throw new RuntimeException("Vehicle not found");
 *   }
 *   
 *   // Get current vehicle data for display
 *   VehicleDetailDto vehicle = vehicleApiClient.getVehicleById(vehicleId);
 *   
 *   // Get all vehicles with specific status
 *   List<VehicleDetailDto> active = vehicleApiClient.getAllVehicles("AVAILABLE");
 */
@Slf4j                          // Provides log object for logging statements
@Component                      // Registers as Spring bean for autowiring
@RequiredArgsConstructor        // Creates constructor with all final fields (for dependency injection)
public class VehicleApiClient {

    // ── DEPENDENCIES ──────────────────────────────────────────────────────
    
    /** RestTemplate bean for making HTTP calls to vehicle endpoints */
    private final RestTemplate restTemplate;

    // ── CONFIGURATION ─────────────────────────────────────────────────────
    
    /**
     * Base URL for vehicle API endpoints.
     * 
     * CONFIGURATION:
     *   - Set in application.properties: app.vehicle.api.base-url
     *   - Default: http://localhost:8080/api/vehicles
     *   - Can be overridden via environment variable: VEHICLE_API_BASE_URL
     * 
     * EXAMPLE URLs:
     *   GET  http://localhost:8080/api/vehicles
     *   GET  http://localhost:8080/api/vehicles/{vehicleId}
     *   GET  http://localhost:8080/api/vehicles?status=AVAILABLE
     */
    @Value("${app.vehicle.api.base-url:http://localhost:8080/api/vehicles}")
    private String vehicleApiBaseUrl;

    // ═══════════════════════════════════════════════════════════════════════
    // ████████  GET SINGLE VEHICLE  ████████████████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Fetch a single vehicle by ID with real-time data from Supabase.
     * 
     * WHAT IT DOES:
     *   1. Constructs URL: {baseUrl}/{vehicleId}
     *   2. Makes GET request to vehicle endpoint
     *   3. Deserializes response into VehicleDetailDto
     *   4. Returns current vehicle data from Supabase
     * 
     * EXAMPLE REQUEST:
     *   GET /api/vehicles/f47ac10b-58cc-4372-a567-0e02b2c3d479
     * 
     * EXAMPLE RESPONSE:
     *   {
     *     "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
     *     "plate_number": "ABC-1234",
     *     "make": "Toyota",
     *     "model": "Camry",
     *     "year": 2023,
     *     "fuel_level": 45.5,
     *     "odometer_reading": 12500
     *   }
     * 
     * ERROR HANDLING:
     *   - Logs error and throws RuntimeException if:
     *     * Network error
     *     * Vehicle not found (404)
     *     * Server error (5xx)
     * 
     * @param vehicleId UUID of vehicle to fetch (from fuel_records.vehicle_id)
     * @return VehicleDetailDto with current vehicle data
     * @throws RuntimeException if vehicle not found or API call fails
     */
    public VehicleDetailDto getVehicleById(UUID vehicleId) {
        try {
            // ── STEP 1: Construct the full URL for this vehicle ──
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            log.debug("Fetching vehicle from: {}", url);
            
            // ── STEP 2: Make HTTP GET request and deserialize response ──
            // RestTemplate will:
            //   1. Make GET request to the URL
            //   2. Receive JSON response
            //   3. Use Jackson to deserialize into VehicleDetailDto
            //   4. Return the Java object
            VehicleDetailDto vehicle = restTemplate.getForObject(url, VehicleDetailDto.class);
<<<<<<< HEAD
            if (vehicle == null) {
                throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
            }
=======
>>>>>>> origin/feature/user-management
            
            // ── STEP 3: Log success with vehicle details ──
            log.info("Successfully fetched vehicle: {} - {}", vehicleId, vehicle.getDisplayName());
            
            // ── STEP 4: Return the vehicle data ──
            return vehicle;
            
        } catch (RestClientException e) {
            // Handle any REST client errors (network, parsing, HTTP errors)
            log.error("Error fetching vehicle {}: {}", vehicleId, e.getMessage());
<<<<<<< HEAD
            throw new ResourceNotFoundException("Failed to fetch vehicle details: " + vehicleId, e);
=======
            throw new RuntimeException("Failed to fetch vehicle details: " + vehicleId, e);
>>>>>>> origin/feature/user-management
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████  GET ALL VEHICLES  ██████████████████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Fetch all vehicles with optional status filter.
     * 
     * WHAT IT DOES:
     *   1. Constructs URL with optional status parameter
     *   2. Makes GET request to vehicle endpoint
     *   3. Deserializes response array into List of VehicleDetailDto
     *   4. Returns all matching vehicles
     * 
     * EXAMPLE REQUESTS:
     *   GET /api/vehicles?status=AVAILABLE
     *   GET /api/vehicles?status=IN_USE
     *   GET /api/vehicles (no filter)
     * 
     * STATUS VALUES:
     *   - AVAILABLE: Vehicle ready for use
     *   - IN_USE: Currently assigned to driver
     *   - MAINTENANCE: In service/maintenance
     *   - RETIRED: Out of service
     * 
     * USE CASES:
     *   - Get list of available vehicles for fuel assignment
     *   - Get all active vehicles for dashboard
     *   - Filter vehicles by operational status
     * 
     * @param status Optional vehicle status filter (null = get all)
     * @return List of VehicleDetailDto matching the filter
     * @throws RuntimeException if API call fails
     */
    public List<VehicleDetailDto> getAllVehicles(String status) {
        try {
            // ── STEP 1: Start with base URL ──
            String url = vehicleApiBaseUrl;
            
            // ── STEP 2: Add status filter if provided ──
            if (status != null && !status.isEmpty()) {
                url += "?status=" + status;
            }
            
            log.debug("Fetching all vehicles from: {}", url);
            
            // ── STEP 3: Make HTTP GET request and deserialize response array ──
            // RestTemplate returns VehicleDetailDto[] from JSON array response
            VehicleDetailDto[] vehicles = restTemplate.getForObject(url, VehicleDetailDto[].class);
            
            // ── STEP 4: Convert array to List and handle null response ──
            if (vehicles != null) {
                log.info("Successfully fetched {} vehicles", vehicles.length);
                return List.of(vehicles);  // Convert array to immutable List
            }
            
            // ── STEP 5: Return empty list if no vehicles found ──
            return List.of();  // Empty list (not null, to avoid NullPointerException)
            
        } catch (RestClientException e) {
            log.error("Error fetching all vehicles: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle list", e);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████  VERIFY VEHICLE EXISTS  ██████████████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Verify if a vehicle exists without fetching all its details.
     * Used for quick validation before creating fuel records.
     * 
     * WHAT IT DOES:
     *   1. Attempts to fetch vehicle by ID
     *   2. Returns true if fetch succeeds (vehicle exists)
     *   3. Returns false if fetch fails (vehicle not found)
     * 
     * WHY SEPARATE METHOD:
     *   - More efficient than getVehicleById when you only need to check existence
     *   - Better semantic meaning in code: vehicleExists() is clearer than try/catch
     *   - Prevents exception throwing when vehicle not found is expected
     * 
     * USAGE IN FUEL SERVICE:
     *   // Validate vehicle before creating fuel record
     *   if (!vehicleApiClient.vehicleExists(request.getVehicleId())) {
     *       throw new RuntimeException("Vehicle not found");
     *   }
     * 
     * @param vehicleId UUID to check
     * @return true if vehicle exists, false if not found or error
     */
    public boolean vehicleExists(UUID vehicleId) {
        try {
            // ── STEP 1: Try to fetch vehicle from API ──
            String url = vehicleApiBaseUrl + "/" + vehicleId;
            restTemplate.getForObject(url, VehicleDetailDto.class);
            
            // ── STEP 2: If we got here without exception, vehicle exists ──
            return true;
            
        } catch (RestClientException e) {
            // ── STEP 3: If exception occurred, vehicle not found or error ──
            log.debug("Vehicle {} not found or error occurred: {}", vehicleId, e.getMessage());
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ████████  GET VEHICLE BY PLATE  ████████████████████████████████████
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Get vehicle by license plate number.
     * 
     * WHAT IT DOES:
     *   1. Fetches all vehicles from API (note: not efficient for large fleets)
     *   2. Filters locally by plate number
     *   3. Returns first matching vehicle
     * 
     * LIMITATION:
     *   Currently requires fetching ALL vehicles then filtering locally.
     *   In production, vehicle endpoint should support plate query parameter:
     *     GET /api/vehicles?plate=ABC-1234
     * 
     * USE CASES:
     *   - Find vehicle by plate from fuel entry form
     *   - Verify plate number before creating record
     *   - Display vehicle details in UI
     * 
     * @param plateNumber Vehicle plate (e.g., "ABC-1234")
     * @return VehicleDetailDto if found
     * @throws RuntimeException if vehicle not found or API call fails
     */
    public VehicleDetailDto getVehicleByPlate(String plateNumber) {
        try {
            // ── STEP 1: Fetch all vehicles (ideally filtered on backend) ──
            List<VehicleDetailDto> allVehicles = getAllVehicles(null);
            
            // ── STEP 2: Filter by plate number (case-insensitive) ──
            return allVehicles.stream()
                    .filter(v -> v.getPlateNumber().equalsIgnoreCase(plateNumber))
                    .findFirst()  // Get first match
<<<<<<< HEAD
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + plateNumber));
=======
                    .orElseThrow(() -> new RuntimeException("Vehicle not found: " + plateNumber));
>>>>>>> origin/feature/user-management
                    
        } catch (Exception e) {
            log.error("Error fetching vehicle by plate {}: {}", plateNumber, e.getMessage());
            throw new RuntimeException("Failed to fetch vehicle by plate: " + plateNumber, e);
        }
    }
}
