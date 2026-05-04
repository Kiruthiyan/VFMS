package com.vfms.dsm.controller;

import com.vfms.dsm.entity.TripRequest;
import com.vfms.dsm.service.TripRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripRequestController {

    private final TripRequestService tripRequestService;

    @GetMapping("/driver/{driverId}/active")
    public ResponseEntity<List<TripRequest>> getActiveTripsByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(tripRequestService.getActiveTripsByDriver(driverId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<TripRequest>> getTripsByDriver(
            @PathVariable UUID driverId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(tripRequestService.getTripsByDriver(driverId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripRequest> getTripById(@PathVariable UUID id) {
        return ResponseEntity.ok(tripRequestService.getTripById(id));
    }

    @PostMapping
    public ResponseEntity<TripRequest> createTrip(@RequestBody TripRequest tripRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripRequestService.createTrip(tripRequest));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TripRequest> updateTrip(@PathVariable UUID id, @RequestBody TripRequest tripRequest) {
        return ResponseEntity.ok(tripRequestService.updateTrip(id, tripRequest));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TripRequest> completeTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripRequestService.completeTrip(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<TripRequest> cancelTrip(@PathVariable UUID id) {
        return ResponseEntity.ok(tripRequestService.cancelTrip(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable UUID id) {
        tripRequestService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }
}
