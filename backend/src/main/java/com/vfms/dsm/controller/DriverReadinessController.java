package com.vfms.dsm.controller;

import com.vfms.dsm.entity.DriverReadinessCache;
import com.vfms.dsm.service.DriverReadinessService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverReadinessController {

    private final DriverReadinessService readinessService;

    @GetMapping("/{driverId}/readiness")
    public ResponseEntity<DriverReadinessCache> getReadiness(@PathVariable UUID driverId) {
        return ResponseEntity.ok(readinessService.getReadiness(driverId));
    }

    @GetMapping("/readiness/available")
    public ResponseEntity<List<DriverReadinessCache>> getAvailableReadyDrivers() {
        return ResponseEntity.ok(readinessService.getAvailableReadyDrivers());
    }

    @PostMapping("/{driverId}/readiness/refresh")
    public ResponseEntity<DriverReadinessCache> refresh(@PathVariable UUID driverId) {
        return ResponseEntity.ok(readinessService.refreshForDriver(driverId));
    }
}
