package com.vfms.trip.controller;

import com.vfms.common.enums.Role;
import com.vfms.common.exception.AuthorizationException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.vfms.trip.dto.CreateTripRequestDTO;
import com.vfms.trip.entity.TripRequest;
import com.vfms.trip.service.TripRequestService;
import com.vfms.trip.enums.TripStatus;
import com.vfms.user.entity.User;
import java.util.List;
import java.util.UUID;
import com.vfms.trip.dto.ApprovalDTO;
import com.vfms.trip.dto.VehicleOptionDTO;
import com.vfms.trip.dto.DriverOptionDTO;

/**
 * REST Controller handling all HTTP requests related to Trip Requests.
 * Exposes endpoints for creating, updating, managing lifecycle states, and querying trips.
 */
@RestController
@RequestMapping("/api/trips") // Base URL for all endpoints in this controller
@RequiredArgsConstructor      // Lombok generates a constructor for the final service field
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
    public ResponseEntity<TripRequest> createTrip(
            @Valid @RequestBody CreateTripRequestDTO dto,
            @AuthenticationPrincipal User user) {
        if (isSystemUser(user)) {
            dto.setRequesterId(user.getId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTrip(dto));
    }

    /**
     * Retrieves all trip requests in the system.
     */
    @GetMapping
    public ResponseEntity<List<TripRequest>> getAllTrips(@AuthenticationPrincipal User user) {
        if (isSystemUser(user)) {
            return ResponseEntity.ok(service.getTripsByRequester(user.getId()));
        }
        return ResponseEntity.ok(service.getAllTrips());
    }

    /**
     * Retrieves trip requests filtered by a specific status (e.g., NEW, APPROVED, COMPLETED).
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TripRequest>> getTripsByStatus(
            @PathVariable TripStatus status,
            @AuthenticationPrincipal User user) {
        if (isSystemUser(user)) {
            return ResponseEntity.ok(service.searchTrips(null, status, user.getId()));
        }
        return ResponseEntity.ok(service.getTripsByStatus(status));
    }

    /**
     * Retrieves a single trip request by its unique UUID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TripRequest> getTripById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        if (isDriver(user)) {
            return ResponseEntity.ok(service.getDriverTripById(id, requireDriverId(user)));
        }
        TripRequest trip = service.getTripById(id);
        assertRequesterCanAccessTrip(trip, user);
        return ResponseEntity.ok(trip);
    }

    /**
     * Retrieves all trips associated with a specific requester (user).
     */
    @GetMapping("/requester/{requesterId}")
    public ResponseEntity<List<TripRequest>> getTripsByRequester(
            @PathVariable UUID requesterId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getTripsByRequester(resolveRequesterId(requesterId, user)));
    }

    // ==========================================
    // TRIP LIFECYCLE & MANAGEMENT ENDPOINTS
    // ==========================================

    /**
     * Fully updates/edits an existing trip request.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TripRequest> editTrip(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTripRequestDTO dto,
            @AuthenticationPrincipal User user) {
        assertRequesterCanAccessTrip(service.getTripById(id), user);
        if (isSystemUser(user)) {
            dto.setRequesterId(user.getId());
        }
        return ResponseEntity.ok(service.editTrip(id, dto));
    }

    /**
     * Submits a draft/new trip request for admin/manager approval.
     */
    @PatchMapping("/{id}/submit")
    public ResponseEntity<TripRequest> submitTrip(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        assertRequesterCanAccessTrip(service.getTripById(id), user);
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
    public ResponseEntity<TripRequest> driverAcceptTrip(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.driverAcceptTrip(id, requireDriverId(user)));
    }

    /**
     * Allows an assigned driver to reject the trip request (e.g., due to an emergency).
     */
    @PatchMapping("/{id}/driver-reject")
    public ResponseEntity<TripRequest> driverRejectTrip(
            @PathVariable UUID id,
            @RequestBody ApprovalDTO dto,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.driverRejectTrip(id, dto, requireDriverId(user)));
    }

    /**
     * Marks the trip as START_PENDING (driver requests start; requester must confirm).
     */
    @PatchMapping("/{id}/start")
    public ResponseEntity<TripRequest> startTrip(
            @PathVariable UUID id,
            @RequestBody(required = false) StartTripDTO dto,
            @AuthenticationPrincipal User user) {
        String reason = dto != null ? dto.getReason() : null;
        return ResponseEntity.ok(service.startTrip(id, requireDriverId(user), reason));
    }

    /**
     * Confirms passenger is onboard; transitions START_PENDING → ONGOING and sets startTime.
     * Only requester (SYSTEM_USER) or ADMIN may confirm — not the assigned driver.
     */
    @PatchMapping("/{id}/confirm-start")
    public ResponseEntity<TripRequest> confirmStart(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        if (isDriver(user)) {
            throw new AuthorizationException("Drivers cannot confirm their own trip start.");
        }
        return ResponseEntity.ok(service.confirmStart(id, user != null ? user.getId() : null));
    }

    /**
     * Returns enriched driver and vehicle details for a trip's assignments.
     */
    @GetMapping("/{id}/assignment-details")
    public ResponseEntity<java.util.Map<String, Object>> getAssignmentDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        TripRequest trip = service.getTripById(id);
        assertRequesterCanAccessTrip(trip, user);
        return ResponseEntity.ok(service.getAssignmentDetails(id));
    }

    /**
     * Marks the trip as successfully completed.
     */
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripRequest> completeTrip(
            @PathVariable UUID id,
            @RequestBody(required = false) CompleteRequestDTO dto,
            @AuthenticationPrincipal User user) {
        String reason = dto != null ? dto.getReason() : null;
        return ResponseEntity.ok(service.completeTrip(id, reason, requireDriverId(user)));
    }

    /**
     * Records the arrival time at the next intermediate stop.
     */
    @PatchMapping("/{id}/log-stop")
    public ResponseEntity<TripRequest> logStopArrival(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.logStopArrival(id, requireDriverId(user)));
    }

    /**
     * Retrieves the list of vehicle IDs currently assigned to active trips.
     */
    @GetMapping("/active-vehicle-ids")
    public ResponseEntity<List<Long>> getActiveVehicleIds() {
        return ResponseEntity.ok(service.getActiveVehicleIds());
    }

    /**
     * Cancels the trip. Requester (owner)/ADMIN/APPROVER may cancel from most pre-start statuses;
     * the assigned DRIVER may cancel their own trip only once DRIVER_CONFIRMED/START_PENDING.
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripRequest> cancelTrip(
            @PathVariable UUID id,
            @RequestBody(required = false) ApprovalDTO dto,
            @AuthenticationPrincipal User user) {
        String notes = dto != null ? dto.getNotes() : null;
        String actorLabel = (user != null ? user.getRole().name() : "UNKNOWN") +
                " (" + (user != null ? user.getFullName() : "Unknown") + ")";
        if (isDriver(user)) {
            return ResponseEntity.ok(service.cancelTrip(id, requireDriverId(user), notes, true, actorLabel));
        }
        TripRequest trip = service.getTripById(id);
        assertRequesterCanAccessTrip(trip, user);
        UUID approverId = dto != null ? dto.getApproverId() : null;
        return ResponseEntity.ok(service.cancelTrip(id, approverId, notes, false, actorLabel));
    }

    // ==========================================
    // USER-SPECIFIC & ADVANCED QUERY ENDPOINTS
    // ==========================================

    /**
     * Retrieves all trips assigned to a specific driver.
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<TripRequest>> getTripsByDriver(
            @PathVariable UUID driverId,
            @AuthenticationPrincipal User user) {
        assertDriverCanAccessDriverId(driverId, user);
        return ResponseEntity.ok(service.getTripsByDriver(driverId));
    }

    /**
     * Retrieves upcoming (not yet started/completed) trips for a specific driver.
     */
    @GetMapping("/driver/{driverId}/upcoming")
    public ResponseEntity<List<TripRequest>> getUpcomingTripsByDriver(
            @PathVariable UUID driverId,
            @AuthenticationPrincipal User user) {
        assertDriverCanAccessDriverId(driverId, user);
        return ResponseEntity.ok(service.getUpcomingTripsByDriver(driverId));
    }

    /**
     * Retrieves the past trip history (completed/cancelled) for a specific requester.
     */
    @GetMapping("/requester/{requesterId}/history")
    public ResponseEntity<List<TripRequest>> getRequesterTripHistory(
            @PathVariable UUID requesterId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getRequesterTripHistory(resolveRequesterId(requesterId, user)));
    }

    /**
     * Retrieves currently active trips (new, submitted, approved, ongoing) for a requester.
     */
    @GetMapping("/requester/{requesterId}/active")
    public ResponseEntity<List<TripRequest>> getRequesterActiveTrips(
            @PathVariable UUID requesterId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(service.getRequesterActiveTrips(resolveRequesterId(requesterId, user)));
    }

    /**
     * Retrieves trips formatted or filtered for a calendar view, based on year and month.
     */
    @GetMapping("/calendar")
    public ResponseEntity<List<TripRequest>> getTripsForCalendar(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal User user) {
        List<TripRequest> trips = service.getTripsForCalendar(year, month);
        if (isSystemUser(user)) {
            UUID userId = user.getId();
            trips = trips.stream()
                    .filter(trip -> userId.equals(trip.getRequesterId()))
                    .toList();
        }
        return ResponseEntity.ok(trips);
    }

    /**
     * Searches for trips using optional filtering criteria (destination, status, requester).
     */
    @GetMapping("/search")
    public ResponseEntity<List<TripRequest>> searchTrips(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) TripStatus status,
            @RequestParam(required = false) UUID requesterId,
            @AuthenticationPrincipal User user) {
        UUID effectiveRequesterId = isSystemUser(user) ? user.getId() : requesterId;
        return ResponseEntity.ok(service.searchTrips(destination, status, effectiveRequesterId));
    }

    /**
     * Submits driver rating and feedback for a completed trip.
     */
    @PatchMapping("/{id}/feedback")
    public ResponseEntity<TripRequest> submitDriverFeedback(
            @PathVariable UUID id,
            @Valid @RequestBody FeedbackDTO dto,
            @AuthenticationPrincipal User user) {
        assertRequesterCanAccessTrip(service.getTripById(id), user);
        return ResponseEntity.ok(service.submitDriverFeedback(id, dto.getRating(), dto.getFeedback(), dto.getStaffTimelineReason()));
    }

    // Static DTO for holding start-trip requests (optional early-start reason)
    @lombok.Data
    public static class StartTripDTO {
        private String reason;
    }

    // Static DTO for holding feedback requests
    @lombok.Data
    public static class FeedbackDTO {
        private Integer rating;
        private String feedback;
        private String staffTimelineReason;
    }

    // Static DTO for holding completion requests
    @lombok.Data
    public static class CompleteRequestDTO {
        private String reason;
    }

    private boolean isDriver(User user) {
        return user != null && user.getRole() == Role.DRIVER;
    }

    private boolean isSystemUser(User user) {
        return user != null && user.getRole() == Role.SYSTEM_USER;
    }

    private UUID requireDriverId(User user) {
        if (!isDriver(user) || user.getId() == null) {
            throw new AuthorizationException("Authenticated driver is required.");
        }
        return user.getId();
    }

    private UUID resolveRequesterId(UUID requestedRequesterId, User user) {
        if (isSystemUser(user)) {
            UUID currentUserId = user.getId();
            if (!currentUserId.equals(requestedRequesterId)) {
                throw new AuthorizationException("Users can only access their own trip requests.");
            }
            return currentUserId;
        }
        return requestedRequesterId;
    }

    private void assertRequesterCanAccessTrip(TripRequest trip, User user) {
        if (isSystemUser(user) && !user.getId().equals(trip.getRequesterId())) {
            throw new AuthorizationException("Users can only access their own trip requests.");
        }
    }

    private void assertDriverCanAccessDriverId(UUID driverId, User user) {
        if (isDriver(user) && !user.getId().equals(driverId)) {
            throw new AuthorizationException("Drivers can only access their own trips.");
        }
    }
}
