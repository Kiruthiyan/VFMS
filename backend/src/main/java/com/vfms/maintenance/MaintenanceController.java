package com.vfms.maintenance;

import com.vfms.common.dto.ApiResponse;
import com.vfms.common.file.SafeFileStorage;
import com.vfms.fleet.service.FleetDocumentStorageService;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;
    private final FleetDocumentStorageService fleetDocumentStorageService;

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> createRequest(
            @Valid @RequestBody MaintenanceRequestDto request) {
        MaintenanceResponseDto response = maintenanceService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Maintenance request created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> updateRequest(
            @PathVariable Long id, @Valid @RequestBody MaintenanceRequestDto request) {
        MaintenanceResponseDto response = maintenanceService.updateRequest(id, request);
        return ResponseEntity.ok(ApiResponse.success("Request updated", response));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> approveRequest(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.approveRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request approved", response));
    }

    // Reason is required on rejection so there is an auditable record of why the request was turned down, which is needed for dispute resolution
    @PatchMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> rejectRequest(
            @PathVariable Long id, @RequestParam String reason) {
        MaintenanceResponseDto response = maintenanceService.rejectRequest(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Request rejected", response));
    }

    // Submit is a separate step from create so a request can be drafted and reviewed internally before it enters the approval workflow
    @PatchMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> submitRequest(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.submitRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Request submitted for approval", response));
    }

    // Actual cost is supplied at close time rather than upfront because the final amount often differs from the initial estimate in the quotation
    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> closeRequest(
            @PathVariable Long id, @RequestParam BigDecimal actualCost) {
        MaintenanceResponseDto response = maintenanceService.closeRequest(id, actualCost);
        return ResponseEntity.ok(ApiResponse.success("Request closed", response));
    }

    // Filtering is handled here rather than through separate endpoints so clients can use one URL with optional params instead of multiple routes
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> getRequestById(@PathVariable Long id) {
        MaintenanceResponseDto response = maintenanceService.getRequestById(id);
        return ResponseEntity.ok(ApiResponse.success("Request fetched", response));
    }

    @PostMapping("/{id}/quotation")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> uploadQuotation(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String fileReference = fleetDocumentStorageService.uploadMaintenanceDocument(id, "quotation", file);
        MaintenanceResponseDto response = maintenanceService.uploadQuotation(id, fileReference);
        return ResponseEntity.ok(ApiResponse.success("Quotation uploaded", response));
    }

    @PostMapping("/{id}/invoice")
    public ResponseEntity<ApiResponse<MaintenanceResponseDto>> uploadInvoice(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String fileReference = fleetDocumentStorageService.uploadMaintenanceDocument(id, "invoice", file);
        MaintenanceResponseDto response = maintenanceService.uploadInvoice(id, fileReference);
        return ResponseEntity.ok(ApiResponse.success("Invoice uploaded", response));
    }

    @GetMapping("/files/access")
    public ResponseEntity<ApiResponse<String>> getFileAccess(@RequestParam("ref") String reference) {
        String signedUrl = fleetDocumentStorageService.createSignedUrlForMaintenance(reference);
        return ResponseEntity.ok(ApiResponse.success("Document access link created", signedUrl));
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = SafeFileStorage.resolveDownloadPath(Paths.get("uploads/maintenance"), fileName);
            Resource resource = SafeFileStorage.loadResource(filePath);

            // PDFs are served inline so reviewers can preview documents directly in the browser without being forced to download them first
            String contentType = SafeFileStorage.contentTypeFor(fileName);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .header("Content-Type", contentType)
                    .body(resource);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + e.getMessage());
        }
    }

    // Scoped to a single vehicle so the report stays actionable — a fleet-wide downtime dump would be too broad to drive per-vehicle maintenance decisions
    @GetMapping("/reports/downtime")
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDto>>> getDowntimeReport(
            @RequestParam Long vehicleId) {
        List<MaintenanceResponseDto> response = maintenanceService.getDowntimeByVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Downtime report fetched", response));
    }

    @GetMapping("/reports/pending")
    public ResponseEntity<ApiResponse<List<MaintenanceResponseDto>>> getPendingApprovals() {
        List<MaintenanceResponseDto> response = maintenanceService.getPendingApprovals();
        return ResponseEntity.ok(ApiResponse.success("Pending approvals fetched", response));
    }

    @GetMapping("/reports/cost-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCostSummary() {
        return ResponseEntity.ok(
                ApiResponse.success("Cost summary fetched", maintenanceService.getMaintenanceCostSummary()));
    }

    @GetMapping("/reports/cost-by-type")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getCostByType() {
        return ResponseEntity.ok(
                ApiResponse.success("Cost by type fetched", maintenanceService.getCostByMaintenanceType()));
    }

    @GetMapping("/reports/cost-per-vehicle")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCostPerVehicle() {
        return ResponseEntity.ok(
                ApiResponse.success("Cost per vehicle fetched", maintenanceService.getCostPerVehicle()));
    }
}
