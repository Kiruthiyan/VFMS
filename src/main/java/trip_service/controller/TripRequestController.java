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

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripRequestController {

    private final TripRequestService service;

    @PostMapping
    public ResponseEntity<TripRequest> createTrip(@Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTrip(dto));
    }

    @GetMapping
    public ResponseEntity<List<TripRequest>> getAllTrips() {
        return ResponseEntity.ok(service.getAllTrips());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TripRequest>> getTripsByStatus(@PathVariable TripStatus status) {
        return ResponseEntity.ok(service.getTripsByStatus(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripRequest> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTripById(id));
    }

    @GetMapping("/requester/{requesterId}")
    public ResponseEntity<List<TripRequest>> getTripsByRequester(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getTripsByRequester(requesterId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripRequest> editTrip(@PathVariable UUID id, @Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.ok(service.editTrip(id, dto));
    }

    @PatchMapping("/{id}/submit")
    public ResponseEntity<TripRequest> submitTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submitTrip(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<TripRequest> approveTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.approveTrip(id, dto));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<TripRequest> rejectTrip(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.rejectTrip(id, dto));
    }

    @PatchMapping("/{id}/assign-driver")
    public ResponseEntity<TripRequest> assignDriver(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.assignDriver(id, dto));
    }

    @PatchMapping("/{id}/assign-vehicle")
    public ResponseEntity<TripRequest> assignVehicle(@PathVariable UUID id, @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.assignVehicle(id, dto));
    }

    @GetMapping("/available-vehicles")
    public ResponseEntity<List<VehicleOptionDTO>> getAvailableVehicles() {
        return ResponseEntity.ok(service.getAvailableVehicles());
    }

    @GetMapping("/available-drivers")
    public ResponseEntity<List<DriverOptionDTO>> getAvailableDrivers() {
        return ResponseEntity.ok(service.getAvailableDrivers());
    }

    @PatchMapping("/{id}/start")
    public ResponseEntity<TripRequest> startTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.startTrip(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripRequest> completeTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.completeTrip(id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripRequest> cancelTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancelTrip(id));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<TripRequest>> getTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(service.getTripsByDriver(driverId));
    }

    @GetMapping("/driver/{driverId}/upcoming")
    public ResponseEntity<List<TripRequest>> getUpcomingTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(service.getUpcomingTripsByDriver(driverId));
    }

    @GetMapping("/requester/{requesterId}/history")
    public ResponseEntity<List<TripRequest>> getRequesterTripHistory(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getRequesterTripHistory(requesterId));
    }

    @GetMapping("/requester/{requesterId}/active")
    public ResponseEntity<List<TripRequest>> getRequesterActiveTrips(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getRequesterActiveTrips(requesterId));
    }

    @GetMapping("/calendar")
    public ResponseEntity<List<TripRequest>> getTripsForCalendar(
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(service.getTripsForCalendar(year, month));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TripRequest>> searchTrips(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) TripStatus status,
            @RequestParam(required = false) UUID requesterId) {
        return ResponseEntity.ok(service.searchTrips(destination, status, requesterId));
    }
}