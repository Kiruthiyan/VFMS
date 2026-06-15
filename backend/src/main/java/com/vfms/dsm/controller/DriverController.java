package com.vfms.dsm.controller;

import com.vfms.dsm.dto.DriverUserResponse;
import com.vfms.dsm.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

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
}
