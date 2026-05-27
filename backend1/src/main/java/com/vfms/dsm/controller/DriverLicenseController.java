package com.vfms.dsm.controller;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.service.DriverLicenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController @RequestMapping("/api/drivers") @RequiredArgsConstructor
public class DriverLicenseController {
    private final DriverLicenseService licenseService;

    @PostMapping("/{driverId}/licenses")
    public ResponseEntity<DriverLicenseResponse> addLicense(@PathVariable UUID driverId, @Valid @RequestBody DriverLicenseRequest request) {
        request.setDriverId(driverId);
        return ResponseEntity.status(HttpStatus.CREATED).body(licenseService.addLicense(request));
    }

    @GetMapping("/{driverId}/licenses")
    public ResponseEntity<List<DriverLicenseResponse>> getLicenses(@PathVariable UUID driverId) {
        return ResponseEntity.ok(licenseService.getLicensesByDriver(driverId));
    }

    @PutMapping("/licenses/{id}")
    public ResponseEntity<DriverLicenseResponse> updateLicense(@PathVariable Long id, @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.ok(licenseService.updateLicense(id, request));
    }

    @DeleteMapping("/licenses/{id}")
    public ResponseEntity<Void> deleteLicense(@PathVariable Long id) {
        licenseService.deleteLicense(id);
        return ResponseEntity.noContent().build();
    }
}
