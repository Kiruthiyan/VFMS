package trip_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trip_service.dto.ApprovalDTO;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;
import trip_service.service.TripRequestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripRequestController {

    private final TripRequestService service;

    // POST /api/trips → create trip
    @PostMapping
    public ResponseEntity<TripRequest> createTrip(@Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTrip(dto));
    }

    // PUT /api/trips/{id} → edit trip
    @PutMapping("/{id}")
    public ResponseEntity<TripRequest> editTrip(@PathVariable UUID id,
                                                @Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.ok(service.editTrip(id, dto));
    }

    // PATCH /api/trips/{id}/submit → submit trip
    @PatchMapping("/{id}/submit")
    public ResponseEntity<TripRequest> submitTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.submitTrip(id));
    }

    // PATCH /api/trips/{id}/approve → approve trip
    @PatchMapping("/{id}/approve")
    public ResponseEntity<TripRequest> approveTrip(@PathVariable UUID id,
                                                   @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.approveTrip(id, dto));
    }

    // PATCH /api/trips/{id}/reject → reject trip
    @PatchMapping("/{id}/reject")
    public ResponseEntity<TripRequest> rejectTrip(@PathVariable UUID id,
                                                  @RequestBody ApprovalDTO dto) {
        return ResponseEntity.ok(service.rejectTrip(id, dto));
    }

    // PATCH /api/trips/{id}/start → start trip
    @PatchMapping("/{id}/start")
    public ResponseEntity<TripRequest> startTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.startTrip(id));
    }

    // PATCH /api/trips/{id}/complete → complete trip
    @PatchMapping("/{id}/complete")
    public ResponseEntity<TripRequest> completeTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.completeTrip(id));
    }

    // PATCH /api/trips/{id}/cancel → cancel trip
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripRequest> cancelTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(service.cancelTrip(id));
    }

    // GET /api/trips → all trips
    @GetMapping
    public ResponseEntity<List<TripRequest>> getAllTrips() {
        return ResponseEntity.ok(service.getAllTrips());
    }

    // GET /api/trips/{id} → single trip
    @GetMapping("/{id}")
    public ResponseEntity<TripRequest> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTripById(id));
    }

    // GET /api/trips/requester/{requesterId}
    @GetMapping("/requester/{requesterId}")
    public ResponseEntity<List<TripRequest>> getTripsByRequester(@PathVariable UUID requesterId) {
        return ResponseEntity.ok(service.getTripsByRequester(requesterId));
    }

    // GET /api/trips/driver/{driverId}
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<TripRequest>> getTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(service.getTripsByDriver(driverId));
    }

    // GET /api/trips/status/{status}
    @GetMapping("/status/{status}")
    public ResponseEntity<List<TripRequest>> getTripsByStatus(@PathVariable TripStatus status) {
        return ResponseEntity.ok(service.getTripsByStatus(status));
    }
}