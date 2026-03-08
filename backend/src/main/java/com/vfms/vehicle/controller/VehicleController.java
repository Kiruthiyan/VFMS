package com.vfms.vehicle.controller;

import com.vfms.vehicle.model.Vehicle;
import com.vfms.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService service;

    /**
     * Retrieves all vehicles.
     * 
     * @return List of all vehicles.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'DRIVER', 'APPROVER')")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(service.getAllVehicles());
    }

    /**
     * Retrieves a vehicle by potentially its ID.
     * 
     * @param id The vehicle ID.
     * @return The vehicle details.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'DRIVER', 'APPROVER')")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getVehicleById(id));
    }

    /**
     * Creates a new vehicle.
     * 
     * @param vehicle The vehicle details.
     * @return The created vehicle.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.createVehicle(vehicle));
    }

    /**
     * Updates an existing vehicle.
     * 
     * @param id      The vehicle ID.
     * @param vehicle The updated details.
     * @return The updated vehicle.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Integer id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.updateVehicle(id, vehicle));
    }

    /**
     * Deletes a vehicle.
     * 
     * @param id The vehicle ID.
     * @return No content.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        service.deleteVehicle(id);
        return ResponseEntity.ok().build();
    }
}
