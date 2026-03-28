package com.vfms.maintenance;

import com.vfms.common.dto.ApiResponse;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    // POST /api/maintenance
    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> createRequest(
            @Valid @RequestBody MaintenanceRequestDto request) {
        MaintenanceResponseDto response = maintenanceService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance request created", response));
    }

        // PUT /api/maintenance/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> updateRequest(
            @PathVariable Long id, @Valid @RequestBody MaintenanceRequestDto request) {
        MaintenanceResponseDto response = maintenanceService.updateRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Request updated", response));
    }
    

        // PATCH /api/maintenance/{id}/approve
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> approveRequest(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request approved", response));
    }

    // PATCH /api/maintenance/{id}/reject?reason=...
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> rejectRequest(
            @PathVariable Long id, @RequestParam String reason) {
        MaintenanceResponseDto response = maintenanceService.rejectRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", response));
    }


        // PATCH /api/maintenance/{id}/submit
    @PatchMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> submitRequest(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.submitRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request submitted for approval", response));
    }

        // PATCH /api/maintenance/{id}/close?actualCost=...
    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> closeRequest(
            @PathVariable Long id, @RequestParam java.math.BigDecimal actualCost) {
        MaintenanceResponseDto response = maintenanceService.closeRequest(id, actualCost);
        return ResponseEntity.ok(ApiResponse.success("Request closed", response));
    }

        // GET /api/maintenance
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<MaintenanceResponseDto>>> getAllRequests(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) Long vehicleId) {
        java.util.List<MaintenanceResponseDto> response;
        if (status != null) {
            response = maintenanceService.getRequestsByStatus(status);
        } else if (vehicleId != null) {
            response = maintenanceService.getRequestsByVehicle(vehicleId);
        } else {
            response = maintenanceService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success("Requests fetched", response));
    }




}
