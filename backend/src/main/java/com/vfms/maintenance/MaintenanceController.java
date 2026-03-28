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

}
