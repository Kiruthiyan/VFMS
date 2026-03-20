package com.vfms.fuel.controller;

import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.service.FuelService;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
public class FuelController {

    private final FuelService fuelService;

    // ── CREATE ────────────────────────────────────────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER')")
    public ResponseEntity<FuelRecordResponse> create(
            @Valid @RequestPart("data") CreateFuelRecordRequest request,
            @RequestPart(value = "receipt", required = false)
            MultipartFile receipt,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fuelService.createFuelRecord(request, receipt, user));
    }

    // ── READ ALL ──────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER','APPROVER')")
    public ResponseEntity<List<FuelRecordResponse>> getAll() {
        return ResponseEntity.ok(fuelService.getAllRecords());
    }

    // ── READ BY ID ────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER','APPROVER')")
    public ResponseEntity<FuelRecordResponse> getById(
            @PathVariable UUID id) {
        return ResponseEntity.ok(fuelService.getById(id));
    }

    // ── BY VEHICLE ────────────────────────────────────────────────────────

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER','APPROVER')")
    public ResponseEntity<List<FuelRecordResponse>> getByVehicle(
            @PathVariable UUID vehicleId) {
        return ResponseEntity.ok(fuelService.getByVehicle(vehicleId));
    }

    // ── BY DRIVER ─────────────────────────────────────────────────────────

    @GetMapping("/driver/{driverId}")
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER','APPROVER')")
    public ResponseEntity<List<FuelRecordResponse>> getByDriver(
            @PathVariable UUID driverId) {
        return ResponseEntity.ok(fuelService.getByDriver(driverId));
    }

    // ── FLAGGED RECORDS ───────────────────────────────────────────────────

    @GetMapping("/flagged")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FuelRecordResponse>> getFlagged() {
        return ResponseEntity.ok(fuelService.getFlaggedRecords());
    }

    // ── FILTERED ──────────────────────────────────────────────────────────

    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('ADMIN','SYSTEM_USER','APPROVER')")
    public ResponseEntity<List<FuelRecordResponse>> filter(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) UUID vehicleId,
            @RequestParam(required = false) UUID driverId) {
        return ResponseEntity.ok(
                fuelService.getByDateRange(from, to, vehicleId, driverId));
    }
}
