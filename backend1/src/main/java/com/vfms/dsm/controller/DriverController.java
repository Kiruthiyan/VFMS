package com.vfms.dsm.controller;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.service.DriverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

    @PostMapping
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driverService.createDriver(request));
    }

    // UUID path validation keeps malformed IDs from reaching the service layer.
    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<DriverResponse> getDriver(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.getDriver(id));
    }

    // The list endpoint uses simple paging params so the frontend can request predictable tables.
    @GetMapping
    public ResponseEntity<Page<DriverResponse>> getAllDrivers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {
        return ResponseEntity.ok(driverService.getAllDrivers(PageRequest.of(page, size, Sort.by(sort).descending())));
    }

    @PutMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable UUID id, @Valid @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    // Status-changing operations are modeled as PATCH requests because they update a single aspect of the resource.
    @PatchMapping("/{id:[0-9a-fA-F\\-]{36}}/deactivate")
    public ResponseEntity<Void> deactivateDriver(@PathVariable UUID id) {
        driverService.deactivateDriver(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id:[0-9a-fA-F\\-]{36}}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable UUID id, @RequestParam Driver.DriverStatus status) {
        driverService.updateStatus(id, status);
        return ResponseEntity.noContent().build();
    }
}
