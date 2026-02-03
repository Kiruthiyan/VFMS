package com.vfms.trip.controller;

import com.vfms.trip.model.Trip;
import com.vfms.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {
    private final TripService service;

    /**
     * Retrieves all trips.
     * 
     * @return List of all trips.
     */
    @GetMapping
    public ResponseEntity<List<Trip>> getAllTrips() {
        return ResponseEntity.ok(service.getAllTrips());
    }

    @GetMapping("/driver/{id}")
    public ResponseEntity<List<Trip>> getTripsByDriver(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getTripsByDriver(id));
    }

    @GetMapping("/requester/{id}")
    public ResponseEntity<List<Trip>> getTripsByRequester(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getTripsByRequester(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Trip>> getTripsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getTripsByStatus(com.vfms.trip.model.TripStatus.valueOf(status)));
    }

    /**
     * Retrieves a trip by ID.
     * 
     * @param id The trip ID.
     * @return The trip details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Trip> getTrip(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getTripById(id));
    }

    /**
     * Creates a new trip.
     * 
     * @param trip The trip details.
     * @return The created trip.
     */
    @PostMapping
    public ResponseEntity<Trip> createTrip(@RequestBody Trip trip) {
        return ResponseEntity.ok(service.createTrip(trip));
    }

    /**
     * Updates an existing trip (e.g. status update).
     * 
     * @param id   The trip ID.
     * @param trip The updated details.
     * @return The updated trip.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Trip> updateTrip(@PathVariable Integer id, @RequestBody Trip trip) {
        return ResponseEntity.ok(service.updateTrip(id, trip));
    }

    /**
     * Deletes a trip.
     * 
     * @param id The trip ID.
     * @return No content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Integer id) {
        service.deleteTrip(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<Trip> startTrip(@PathVariable Integer id) {
        return ResponseEntity.ok(service.startTrip(id));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Trip> completeTrip(@PathVariable Integer id, @RequestBody com.vfms.trip.dto.TripCompletionRequest request) {
        return ResponseEntity.ok(service.completeTrip(id, request));
    }
}
