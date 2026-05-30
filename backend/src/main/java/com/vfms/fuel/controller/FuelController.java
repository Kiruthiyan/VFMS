package com.vfms.fuel.controller;

import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelFormMetadataResponse;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.dto.PatchFuelRecordRequest;
import com.vfms.fuel.service.FuelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fuel")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class FuelController {

    private final FuelService fuelService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FuelRecordResponse> createFuelRecord(
            @Valid @RequestPart("data") CreateFuelRecordRequest request,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fuelService.createFuelRecord(request, receipt, user));
    }

    @GetMapping
    public ResponseEntity<List<FuelRecordResponse>> getAllRecords() {
        return ResponseEntity.ok(fuelService.getAllRecords());
    }

    @GetMapping("/metadata")
    public ResponseEntity<FuelFormMetadataResponse> getFormMetadata() {
        return ResponseEntity.ok(fuelService.getFormMetadata());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> getFuelRecord(@PathVariable UUID id) {
        return ResponseEntity.ok(fuelService.getById(id));
    }

    @GetMapping("/{id}/with-vehicle-data")
    public ResponseEntity<FuelRecordResponse> getFuelRecordWithVehicleData(@PathVariable UUID id) {
        return ResponseEntity.ok(fuelService.getFuelRecordWithRealTimeData(id));
    }

    @GetMapping("/realtime/all")
    public ResponseEntity<List<FuelRecordResponse>> getAllRecordsWithRealTimeData() {
        return ResponseEntity.ok(fuelService.getAllRecordsWithRealTimeData());
    }

    @GetMapping("/search")
    public ResponseEntity<List<FuelRecordResponse>> searchFuelRecords(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) UUID driverId) {
        return ResponseEntity.ok(fuelService.getByDateRange(from, to, vehicleId, driverId));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicle(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelService.getByVehicle(vehicleId));
    }

    @GetMapping("/vehicle/{vehicleId}/realtime")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByVehicleRealTime(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelService.getByVehicleWithRealTimeData(vehicleId));
    }

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<FuelRecordResponse>> getFuelByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(fuelService.getByDriver(driverId));
    }

    @GetMapping("/flagged")
    public ResponseEntity<List<FuelRecordResponse>> getFlaggedRecords() {
        return ResponseEntity.ok(fuelService.getFlaggedRecords());
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> updateFuelRecord(
            @PathVariable UUID id,
            @Valid @RequestBody CreateFuelRecordRequest request) {
        return ResponseEntity.ok(fuelService.updateFuelRecord(id, request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<FuelRecordResponse> patchFuelRecord(
            @PathVariable UUID id,
            @Valid @RequestBody PatchFuelRecordRequest updates) {
        return ResponseEntity.ok(fuelService.patchFuelRecord(id, updates));
    }

    @PatchMapping("/{id}/flag")
    public ResponseEntity<FuelRecordResponse> flagFuelRecord(@PathVariable UUID id) {
        return ResponseEntity.ok(fuelService.flagFuelRecord(id));
    }

    @PatchMapping("/{id}/unflag")
    public ResponseEntity<FuelRecordResponse> unflagFuelRecord(@PathVariable UUID id) {
        return ResponseEntity.ok(fuelService.unflagFuelRecord(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelRecord(@PathVariable UUID id) {
        fuelService.deleteFuelRecord(id);
        return ResponseEntity.noContent().build();
    }
}
