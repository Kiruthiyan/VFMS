package com.vfms.vehicle.controller;

import com.vfms.vehicle.model.Vehicle;
import com.vfms.vehicle.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {
    private final VehicleService vehicleService;

    /**
     * Get all vehicles with pagination
     */
    @GetMapping
<<<<<<< HEAD
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'DRIVER', 'APPROVER')")
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(service.getAllVehicles());
=======
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<Page<Vehicle>> getAllVehicles(Pageable pageable) {
        log.info("Fetching all vehicles with pagination");
        return ResponseEntity.ok(vehicleService.getAllVehicles(pageable));
>>>>>>> 0c49f51 (fixed user verification)
    }

    /**
     * Get all vehicles (non-paginated)
     */
    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<List<Vehicle>> getAllVehiclesNonPaginated() {
        log.info("Fetching all vehicles (non-paginated)");
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    /**
     * Get all active vehicles
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<Page<Vehicle>> getActiveVehicles(Pageable pageable) {
        log.info("Fetching active vehicles");
        return ResponseEntity.ok(vehicleService.getActiveVehicles(pageable));
    }

    /**
     * Get vehicle by ID
     */
    @GetMapping("/{id}")
<<<<<<< HEAD
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'DRIVER', 'APPROVER')")
    public ResponseEntity<Vehicle> getVehicle(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getVehicleById(id));
=======
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<Vehicle> getVehicleById(@PathVariable Integer id) {
        log.info("Fetching vehicle with id: {}", id);
        return vehicleService.getVehicleById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
>>>>>>> 0c49f51 (fixed user verification)
    }

    /**
     * Get vehicle by license plate
     */
    @GetMapping("/by-plate/{licensePlate}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<Vehicle> getVehicleByPlate(@PathVariable String licensePlate) {
        log.info("Fetching vehicle with plate: {}", licensePlate);
        return vehicleService.getVehicleByPlate(licensePlate)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new vehicle (ADMIN only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> createVehicle(@RequestBody Vehicle vehicle) {
        log.info("Creating new vehicle: {} {}", vehicle.getMake(), vehicle.getModel());
        Vehicle createdVehicle = vehicleService.createVehicle(vehicle);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVehicle);
    }

    /**
     * Update vehicle (ADMIN only)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
<<<<<<< HEAD
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Integer id, @RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(service.updateVehicle(id, vehicle));
=======
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Integer id, @RequestBody Vehicle vehicleDetails) {
        log.info("Updating vehicle with id: {}", id);
        Vehicle updatedVehicle = vehicleService.updateVehicle(id, vehicleDetails);
        return ResponseEntity.ok(updatedVehicle);
>>>>>>> 0c49f51 (fixed user verification)
    }

    /**
     * Delete vehicle (ADMIN only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
<<<<<<< HEAD
    public ResponseEntity<Void> deleteVehicle(@PathVariable Integer id) {
        service.deleteVehicle(id);
        return ResponseEntity.ok().build();
=======
    public ResponseEntity<Map<String, String>> deleteVehicle(@PathVariable Integer id) {
        log.info("Deleting vehicle with id: {}", id);
        vehicleService.deleteVehicle(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Vehicle deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * Deactivate vehicle (ADMIN only)
     */
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> deactivateVehicle(@PathVariable Integer id) {
        log.info("Deactivating vehicle with id: {}", id);
        Vehicle vehicle = vehicleService.deactivateVehicle(id);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * Activate vehicle (ADMIN only)
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehicle> activateVehicle(@PathVariable Integer id) {
        log.info("Activating vehicle with id: {}", id);
        Vehicle vehicle = vehicleService.activateVehicle(id);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * Search vehicles
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<Page<Vehicle>> searchVehicles(
            @RequestParam String query,
            Pageable pageable) {
        log.info("Searching vehicles with query: {}", query);
        return ResponseEntity.ok(vehicleService.searchVehicles(query, pageable));
    }

    /**
     * Get vehicles by fuel type
     */
    @GetMapping("/by-fuel/{fuelType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<List<Vehicle>> getVehiclesByFuelType(@PathVariable String fuelType) {
        log.info("Fetching vehicles by fuel type: {}", fuelType);
        return ResponseEntity.ok(vehicleService.getVehiclesByFuelType(fuelType));
    }

    /**
     * Get vehicles by type
     */
    @GetMapping("/by-type/{vehicleType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER', 'USER')")
    public ResponseEntity<List<Vehicle>> getVehiclesByType(@PathVariable String vehicleType) {
        log.info("Fetching vehicles by type: {}", vehicleType);
        return ResponseEntity.ok(vehicleService.getVehiclesByType(vehicleType));
    }

    /**
     * Get vehicle statistics
     */
    @GetMapping("/stats/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'USER')")
    public ResponseEntity<Map<String, Object>> getVehicleStats() {
        log.info("Fetching vehicle statistics");
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVehicles", vehicleService.countAllVehicles());
        stats.put("activeVehicles", vehicleService.countActiveVehicles());
        return ResponseEntity.ok(stats);
>>>>>>> 0c49f51 (fixed user verification)
    }
}
