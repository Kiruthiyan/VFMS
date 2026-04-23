package com.vfms.maintenance;

import com.vfms.common.dto.ApiResponse;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

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
            @PathVariable Long id, @RequestParam BigDecimal actualCost) {
        MaintenanceResponseDto response = maintenanceService.closeRequest(id, actualCost);
        return ResponseEntity.ok(ApiResponse.success("Request closed", response));
    }

    // GET /api/maintenance
    @GetMapping
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDto>>> getAllRequests(
            @RequestParam(required = false) MaintenanceStatus status,
            @RequestParam(required = false) Long vehicleId) {
        List<MaintenanceResponseDto> response;
        if (status != null) {
            response = maintenanceService.getRequestsByStatus(status);
        } else if (vehicleId != null) {
            response = maintenanceService.getRequestsByVehicle(vehicleId);
        } else {
            response = maintenanceService.getAllRequests();
        }
        return ResponseEntity.ok(ApiResponse.success("Requests fetched", response));
    }

    // GET /api/maintenance/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> getRequestById(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Request fetched", response));
    }

    // POST /api/maintenance/{id}/quotation (file upload)
    @PostMapping("/{id}/quotation")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> uploadQuotation(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String fileName = "quotation_" + id + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/maintenance");
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(fileName);
            file.transferTo(filePath.toFile());
            String fileUrl = "/api/maintenance/files/" + fileName;
            MaintenanceResponseDto response = maintenanceService.uploadQuotation(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Quotation uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload quotation: " + e.getMessage());
        }
    }

    // POST /api/maintenance/{id}/invoice (file upload)
    @PostMapping("/{id}/invoice")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> uploadInvoice(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            String fileName = "invoice_" + id + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/maintenance");
            Files.createDirectories(uploadDir);
            Path filePath = uploadDir.resolve(fileName);
            file.transferTo(filePath.toFile());
            String fileUrl = "/api/maintenance/files/" + fileName;
            MaintenanceResponseDto response = maintenanceService.uploadInvoice(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Invoice uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload invoice: " + e.getMessage());
        }
    }

    // GET /api/maintenance/files/{fileName} (serve uploaded file)
    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads/maintenance").resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());
            String contentType = fileName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .header("Content-Type", contentType)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + e.getMessage());
        }
    }

    // GET /api/maintenance/reports/downtime?vehicleId=...
    @GetMapping("/reports/downtime")
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDto>>> getDowntimeReport(
            @RequestParam Long vehicleId) {
        List<MaintenanceResponseDto> response = maintenanceService.getDowntimeByVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Downtime report fetched", response));
    }

    // GET /api/maintenance/reports/pending
    @GetMapping("/reports/pending")
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDto>>> getPendingApprovals() {
        List<MaintenanceResponseDto> response = maintenanceService.getPendingApprovals();
        return ResponseEntity.ok(ApiResponse.success("Pending approvals fetched", response));
    }

    // GET /api/maintenance/reports/cost-summary
    @GetMapping("/reports/cost-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCostSummary() {
        return ResponseEntity.ok(ApiResponse.success("Cost summary fetched", maintenanceService.getMaintenanceCostSummary()));
    }

    // GET /api/maintenance/reports/cost-by-type
    @GetMapping("/reports/cost-by-type")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getCostByType() {
        return ResponseEntity.ok(ApiResponse.success("Cost by type fetched", maintenanceService.getCostByMaintenanceType()));
    }

    // GET /api/maintenance/reports/cost-per-vehicle
    @GetMapping("/reports/cost-per-vehicle")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCostPerVehicle() {
        return ResponseEntity.ok(ApiResponse.success("Cost per vehicle fetched", maintenanceService.getCostPerVehicle()));
    }

}
