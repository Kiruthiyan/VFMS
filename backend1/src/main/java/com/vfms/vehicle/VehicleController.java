package com.vfms.vehicle;

import com.vfms.common.dto.ApiResponse;
import com.vfms.vehicle.dto.VehicleRequestDto;
import com.vfms.vehicle.dto.VehicleResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponseDto>> addVehicle(
            @Valid @RequestBody VehicleRequestDto request) {
        VehicleResponseDto vehicle = vehicleService.addVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle added successfully", vehicle));
    }

    // Optional param keeps filtering on one endpoint rather than splitting into multiple routes
    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponseDto>>> getAllVehicles(
            @RequestParam(required = false) VehicleStatus status) {
        List<VehicleResponseDto> vehicles = (status != null)
                ? vehicleService.getVehiclesByStatus(status)
                : vehicleService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved", vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> getVehicleById(@PathVariable Long id) {
        VehicleResponseDto vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved", vehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> updateVehicle(
            @PathVariable Long id, @Valid @RequestBody VehicleRequestDto request) {
        VehicleResponseDto vehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicle));
    }

    // Separated from PUT so callers can change availability without sending the full vehicle payload, reducing the risk of accidental field overwrites
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> updateVehicleStatus(
            @PathVariable Long id, @RequestParam VehicleStatus status) {
        VehicleResponseDto vehicle = vehicleService.updateVehicleStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Vehicle status updated", vehicle));
    }

    // Dedicated endpoint so the service can enforce retirement-specific rules (e.g. blocking re-activation)
    @PatchMapping("/{id}/retire")
    public ResponseEntity<ApiResponse<VehicleResponseDto>> retireVehicle(@PathVariable Long id) {
        VehicleResponseDto vehicle = vehicleService.retireVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retired", vehicle));
    }
}