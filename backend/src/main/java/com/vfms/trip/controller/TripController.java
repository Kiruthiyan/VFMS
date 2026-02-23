package com.vfms.trip.controller;

import com.vfms.trip.model.Trip;
import com.vfms.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {
    private final TripService service;

    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(service.getAllTrips());
    }

    @GetMapping("/my-trips")
    public ResponseEntity<List<Trip>> getMyTrips(Authentication authentication) {
        // Get trips for the authenticated driver
        String userEmail = authentication.getName();
        return ResponseEntity.ok(service.getTripsByDriverEmail(userEmail));
    }

    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        return ResponseEntity.ok(service.createTrip(trip));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Trip> updateTripStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateTripStatus(id, status));
    }
}
