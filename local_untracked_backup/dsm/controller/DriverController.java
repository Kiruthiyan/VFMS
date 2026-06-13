package com.vfms.dsm.controller;

import com.vfms.common.enums.Role;
import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.dsm.service.DriverService;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;

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

    /**
     * Returns paginated DRIVER-role users from the users table.
     * The Drivers module listing page uses this to show data entered
     * during the admin "Create User (Driver)" workflow.
     */
    @GetMapping("/from-users")
    public ResponseEntity<Page<DriverUserResponse>> getDriverUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(driverService.getDriverUsers(pageable));
    }

    /**
     * Returns a single DRIVER-role user by their user ID.
     * Used by the driver profile overview tab.
     */
    @GetMapping("/from-users/{userId:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<DriverUserResponse> getDriverUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(driverService.getDriverUserById(userId));
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
