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
}