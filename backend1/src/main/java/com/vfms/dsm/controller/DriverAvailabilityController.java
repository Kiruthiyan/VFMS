package com.vfms.dsm.controller;

import com.vfms.dsm.dto.AvailabilityUpdateRequest;
import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverAvailabilityLog;
import com.vfms.dsm.service.DriverAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverAvailabilityController {

    private final DriverAvailabilityService availabilityService;

    @GetMapping("/{driverId}/availability")
    public ResponseEntity<DriverAvailability> getAvailability(@PathVariable UUID driverId) {
        return ResponseEntity.ok(availabilityService.getAvailability(driverId));
    }

    @PatchMapping("/{driverId}/availability")
    public ResponseEntity<DriverAvailability> updateAvailability(
            @PathVariable UUID driverId,
            @Valid @RequestBody AvailabilityUpdateRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(availabilityService.updateAvailability(driverId, request, userId));
    }

    @GetMapping("/{driverId}/availability/history")
    public ResponseEntity<List<DriverAvailabilityLog>> getHistory(@PathVariable UUID driverId) {
        return ResponseEntity.ok(availabilityService.getAvailabilityHistory(driverId));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<DriverAvailability>> getByStatus(
            @RequestParam DriverAvailability.AvailabilityStatus status) {
        return ResponseEntity.ok(availabilityService.getByStatus(status));
    }
}
