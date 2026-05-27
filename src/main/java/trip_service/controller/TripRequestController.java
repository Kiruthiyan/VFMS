package trip_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.service.TripRequestService;
import trip_service.enums.TripStatus;
import java.util.List;
import java.util.UUID;
import trip_service.dto.ApprovalDTO;
import trip_service.dto.VehicleOptionDTO;
import trip_service.dto.DriverOptionDTO;

/**
 * REST Controller handling all HTTP requests related to Trip Requests.
 * Exposes endpoints for creating, updating, managing lifecycle states, and querying trips.
 */
@RestController
@RequestMapping("/api/trips") // Base URL for all endpoints in this controller
@RequiredArgsConstructor      // Lombok generates a constructor for the final service field
@CrossOrigin(origins = "*")   // Allows cross-origin requests from any domain (e.g., frontend apps)
public class TripRequestController {

    // Service layer dependency where the actual business logic is executed
    private final TripRequestService service;

    // ==========================================
    // CREATION & BASIC RETRIEVAL ENDPOINTS
    // ==========================================

    /**
     * Creates a new trip request.
     * Validates the incoming DTO before passing it to the service.
     */
    @PostMapping
    public ResponseEntity<TripRequest> createTrip(@Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTrip(dto));
    }

    /**
     * Retrieves all trip requests in the system.
     */
    @GetMapping
    public ResponseEntity<List<TripRequest>> getAllTrips() {
        return ResponseEntity.ok(service.getAllTrips());
    }

    /**
     * Retrieves trip requests filtered by a specific status (e.g., NEW, APPROVED, COMPLETED).
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TripRequest>> getTripsByStatus(@PathVariable TripStatus status) {
        return ResponseEntity.ok(service.getTripsByStatus(status));
    }

    /**
     * Retrieves a single trip request by its unique UUID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TripRequest> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTripById(id));
    }

    /**
     * Retrieves all trips associated with a specific requester (user).
     */
    @GetMapping("/requester/{requesterId}")
    public ResponseEntity<List<TripRequest>> getTripsByRequester(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getTripsByRequester(requesterId));
    }

    // ==========================================
    // TRIP LIFECYCLE & MANAGEMENT ENDPOINTS
    // ==========================================

    /**
     * Fully updates/edits an existing trip request.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TripRequest> editTrip(@PathVariable UUID id, @Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.ok(service.editTrip(id, dto));
    }

    /**
     * Submits a draft/new trip request for admin/manager approval.
     */
    @PatchMapping("/{id}/submit")
    public ResponseEntity<TripRequest> submitTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submitTrip(id));
    }

    /**
     * Approves a submitted trip request. Requires approver details in the body.
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<TripRequest> approveTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.approveTrip(id, dto));
    }

    /**
     * Rejects a submitted trip request. Requires rejection reasons/approver details in the body.
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<TripRequest> rejectTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.rejectTrip(id, dto));
    }

    /**
     * Assigns a driver to an approved trip.
     */
    @PatchMapping("/{id}/assign-driver")
    public ResponseEntity<TripRequest> assignDriver(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.assignDriver(id, dto));
    }

    /**
     * Assigns a vehicle to an approved trip.
     */
    @PatchMapping("/{id}/assign-vehicle")
    public ResponseEntity<TripRequest> assignVehicle(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.assignVehicle(id, dto));
    }

    // ==========================================
    // RESOURCE AVAILABILITY ENDPOINTS
    // ==========================================

    /**
     * Retrieves a list of vehicles currently available for assignment.
     */
    @GetMapping("/available-vehicles")
    public ResponseEntity<List<VehicleOptionDTO>> getAvailableVehicles() {
        return ResponseEntity.ok(service.getAvailableVehicles());
    }

    /**
     * Retrieves a list of drivers currently available for assignment.
     */
    @GetMapping("/available-drivers")
    public ResponseEntity<List<DriverOptionDTO>> getAvailableDrivers() {
        return ResponseEntity.ok(service.getAvailableDrivers());
    }

    /**
     * Retrieves a complete list of all drivers in the system, regardless of availability.
     */
    @GetMapping("/all-drivers")
    public ResponseEntity<List<DriverOptionDTO>> getAllDrivers() {
        return ResponseEntity.ok(service.getAllDrivers());
    }

    // ==========================================
    // DRIVER ACTIONS & TRIP EXECUTION ENDPOINTS
    // ==========================================

    /**
     * Allows an assigned driver to accept the trip request.
     */
    @PatchMapping("/{id}/driver-accept")
    public ResponseEntity<TripRequest> driverAcceptTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.driverAcceptTrip(id));
    }

    /**
     * Allows an assigned driver to reject the trip request (e.g., due to an emergency).
     */
    @PatchMapping("/{id}/driver-reject")
    public ResponseEntity<TripRequest> driverRejectTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.driverRejectTrip(id, dto));
    }

    /**
     * Marks the trip as currently ongoing/started.
     */
    @PatchMapping("/{id}/start")
    public ResponseEntity<TripRequest> startTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.startTrip(id));
    }

    /**
     * Marks the trip as successfully completed.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripRequest> completeTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.completeTrip(id));
    }

    /**
     * Cancels the trip outright. Extracts approver ID and cancellation notes from the DTO.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripRequest> cancelTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.cancelTrip(id, dto.getApproverId(), dto.getNotes()));
    }

    // ==========================================
    // USER-SPECIFIC & ADVANCED QUERY ENDPOINTS
    // ==========================================

    /**
     * Retrieves all trips assigned to a specific driver.
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<TripRequest>> getTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(service.getTripsByDriver(driverId));
    }

    /**
     * Retrieves upcoming (not yet started/completed) trips for a specific driver.
     */
    @GetMapping("/driver/{driverId}/upcoming")
    public ResponseEntity<List<TripRequest>> getUpcomingTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(service.getUpcomingTripsByDriver(driverId));
    }

    /**
     * Retrieves the past trip history (completed/cancelled) for a specific requester.
     */
    @GetMapping("/requester/{requesterId}/history")
    public ResponseEntity<List<TripRequest>> getRequesterTripHistory(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getRequesterTripHistory(requesterId));
    }

    /**
     * Retrieves currently active trips (new, submitted, approved, ongoing) for a requester.
     */
    @GetMapping("/requester/{requesterId}/active")
    public ResponseEntity<List<TripRequest>> getRequesterActiveTrips(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getRequesterActiveTrips(requesterId));
    }

    /**
     * Retrieves trips formatted or filtered for a calendar view, based on year and month.
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<TripRequest>> getTripsForCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(service.getTripsForCalendar(year, month));
    }

    /**
     * Searches for trips using optional filtering criteria (destination, status, requester).
     */
    @GetMapping("/search")
    public ResponseEntity<List<TripRequest>> searchTrips(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) TripStatus status,
            @RequestParam(required = false) UUID requesterId) {
        return ResponseEntity.ok(service.searchTrips(destination, status, requesterId));
    }
}