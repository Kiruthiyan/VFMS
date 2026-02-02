package com.vfms.driver.controller;

import com.vfms.auth.model.User;
import com.vfms.driver.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService service;

    /**
     * Retrieves all drivers.
     * 
     * @return List of all drivers.
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllDrivers() {
        return ResponseEntity.ok(service.getAllDrivers());
    }

    /**
     * Retrieves a driver by ID.
     * 
     * @param id The driver ID.
     * @return The driver details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getDriver(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getDriverById(id));
    }

    /**
     * Creates a new driver.
     * 
     * @param driver The driver details.
     * @return The created driver.
     */
    @PostMapping
    public ResponseEntity<User> createDriver(@RequestBody User driver) {
        return ResponseEntity.ok(service.createDriver(driver));
    }

    /**
     * Updates an existing driver.
     * 
     * @param id     The driver ID.
     * @param driver The updated details.
     * @return The updated driver.
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateDriver(@PathVariable Integer id, @RequestBody User driver) {
        return ResponseEntity.ok(service.updateDriver(id, driver));
    }

    /**
     * Deletes a driver.
     * 
     * @param id The driver ID.
     * @return No content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Integer id) {
        service.deleteDriver(id);
        return ResponseEntity.ok().build();
    }
}
