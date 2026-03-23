package com.vfms.vehicle;

import com.vfms.common.dto.ApiResponse;
import com.vfms.vehicle.dto.VehicleRequestDto;
import com.vfms.vehicle.dto.VehicleResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    // POST /api/vehicles
    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponseDto>> addVehicle(
            @Valid @RequestBody VehicleRequestDto request) {
        VehicleResponseDto vehicle = vehicleService.addVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vehicle added successfully", vehicle));
    }

        // GET /api/vehicles
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<VehicleResponseDto>>> getAllVehicles(
            @RequestParam(required = false) VehicleStatus status) {
        java.util.List<VehicleResponseDto> vehicles = (status != null)
                ? vehicleService.getVehiclesByStatus(status)
                : vehicleService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved", vehicles));
    }

}
