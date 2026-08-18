package com.vfms.dsm.controller;

import com.vfms.dsm.dto.DriverRequests.*;
import com.vfms.dsm.dto.DriverResponses.*;
import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverLeave;
import com.vfms.dsm.entity.DriverAggregate.DriverPerformanceScore;
import com.vfms.dsm.entity.DriverAggregate.DriverReadinessCache;
import com.vfms.dsm.service.*;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Approver/admin DSM API. Existing paths and contracts are intentionally explicit. */
@RestController
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
public class DriverController {
    private final DriverService driverService;
    private final DriverCredentialService credentialService;
    private final DriverAssessmentService assessmentService;
    private final DriverRecordService recordService;
    private final DriverReadinessService readinessService;

    @GetMapping("/api/drivers/from-users")
    public ResponseEntity<Page<DriverUserResponse>> getDriverUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(driverService.getDriverUsers(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))));
    }

    @GetMapping("/api/drivers/from-users/{userId:[0-9a-fA-F\\-]{36}}")
    public ResponseEntity<DriverUserResponse> getDriverUserById(@PathVariable UUID userId) {
        return ResponseEntity.ok(driverService.getDriverUserById(userId));
    }

    @PostMapping("/api/drivers/{driverId}/certifications")
    public ResponseEntity<DriverCertification> addCertification(
            @PathVariable UUID driverId, @Valid @RequestBody CertificationRequest request) {
        request.setDriverId(driverId);
        return ResponseEntity.status(HttpStatus.CREATED).body(credentialService.addCertification(request));
    }

    @GetMapping("/api/drivers/{driverId}/certifications")
    public ResponseEntity<List<DriverCertification>> getCertifications(@PathVariable UUID driverId) {
        return ResponseEntity.ok(credentialService.getCertificationsByDriver(driverId));
    }

    @PutMapping("/api/drivers/certifications/{id}")
    public ResponseEntity<DriverCertification> updateCertification(
            @PathVariable Long id, @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(credentialService.updateCertification(id, request));
    }

    @DeleteMapping("/api/drivers/certifications/{id}")
    public ResponseEntity<Void> deleteCertification(@PathVariable Long id) {
        credentialService.deleteCertification(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/drivers/compliance")
    public ResponseEntity<List<DriverComplianceResponse>> getCompliance() {
        return ResponseEntity.ok(assessmentService.getFleetCompliance());
    }

    @PostMapping(value = "/api/drivers/{driverId}/documents",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverDocument> uploadDocument(
            @PathVariable UUID driverId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") DriverDocument.DocumentEntityType entityType,
            @RequestParam(value = "entityId", required = false) Long entityId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recordService.uploadDocument(driverId, file, entityType, entityId));
    }

    @GetMapping("/api/drivers/{driverId}/documents")
    public ResponseEntity<List<DriverDocument>> getDocuments(@PathVariable UUID driverId) {
        return ResponseEntity.ok(recordService.getDocumentsByDriver(driverId));
    }

    // Overrides the class-level @PreAuthorize — profile picture is read-only and needed
    // by every role that can view a trip's driver details, not just APPROVER/ADMIN.
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('APPROVER','ADMIN','SYSTEM_USER','DRIVER')")
    @GetMapping("/api/drivers/{driverId}/profile-picture")
    public ResponseEntity<DriverDocument> getProfilePicture(@PathVariable UUID driverId) {
        DriverDocument document = recordService.getProfilePicture(driverId);
        return document == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(document);
    }

    @DeleteMapping("/api/drivers/documents/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        recordService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/api/drivers/eligibility", "/api/internal/drivers/eligibility"})
    public ResponseEntity<EligibilityCheckResponse> checkEligibility(
            @Valid @RequestBody EligibilityCheckRequest request) {
        return ResponseEntity.ok(assessmentService.checkEligibility(request));
    }

    @GetMapping({"/api/drivers/eligibility", "/api/internal/drivers/eligibility"})
    public ResponseEntity<EligibilityCheckResponse> checkEligibilityGet(
            @RequestParam String employeeId,
            @RequestParam String vehicleCategory,
            @RequestParam String tripDate) {
        EligibilityCheckRequest request = new EligibilityCheckRequest(
                employeeId, vehicleCategory, LocalDate.parse(tripDate));
        return ResponseEntity.ok(assessmentService.checkEligibility(request));
    }

    @GetMapping("/api/drivers/infractions")
    public ResponseEntity<List<DriverInfraction>> getAllInfractions() {
        return ResponseEntity.ok(recordService.getAllInfractions());
    }

    @PostMapping("/api/drivers/infractions")
    public ResponseEntity<DriverInfraction> logInfraction(@Valid @RequestBody InfractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recordService.logInfraction(request));
    }

    @GetMapping("/api/drivers/{driverId:[0-9a-fA-F\\-]{36}}/infractions")
    public ResponseEntity<List<DriverInfraction>> getInfractions(@PathVariable UUID driverId) {
        return ResponseEntity.ok(recordService.getInfractionsByDriver(driverId));
    }

    @PatchMapping("/api/drivers/infractions/{id}/resolve")
    public ResponseEntity<DriverInfraction> resolveInfraction(@PathVariable Long id) {
        return ResponseEntity.ok(recordService.resolveInfraction(id));
    }

    @PostMapping("/api/drivers/leaves")
    public ResponseEntity<DriverLeave> requestLeave(@Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(recordService.requestLeave(request));
    }

    @PatchMapping("/api/drivers/leaves/{leaveId}/process")
    public ResponseEntity<DriverLeave> processLeave(
            @PathVariable Long leaveId,
            @Valid @RequestBody LeaveApprovalRequest request,
            @AuthenticationPrincipal User approver) {
        return ResponseEntity.ok(recordService.processLeave(leaveId, request, approver.getEmail()));
    }

    @GetMapping("/api/drivers/{driverId:[0-9a-fA-F\\-]{36}}/leaves")
    public ResponseEntity<List<DriverLeave>> getLeavesByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(recordService.getLeavesByDriver(driverId));
    }

    @GetMapping("/api/drivers/leaves")
    public ResponseEntity<List<DriverLeave>> getAllLeaves() {
        return ResponseEntity.ok(recordService.getAllLeaves());
    }

    @GetMapping("/api/drivers/leaves/pending")
    public ResponseEntity<List<DriverLeave>> getPendingLeaves() {
        return ResponseEntity.ok(recordService.getPendingLeaves());
    }

    @GetMapping("/api/drivers/leaves/log")
    public ResponseEntity<List<DriverLeave>> getLeavesLog(@RequestParam(required = false) DriverLeave.LeaveStatus status) {
        if (status == null) {
            return ResponseEntity.ok(recordService.getAllLeaves());
        }
        return ResponseEntity.ok(recordService.getLeavesByStatus(status));
    }

    @PostMapping("/api/drivers/{driverId}/licenses")
    public ResponseEntity<DriverLicenseResponse> addLicense(
            @PathVariable UUID driverId, @Valid @RequestBody DriverLicenseRequest request) {
        request.setDriverId(driverId);
        return ResponseEntity.status(HttpStatus.CREATED).body(credentialService.addLicense(request));
    }

    @GetMapping("/api/drivers/{driverId}/licenses")
    public ResponseEntity<List<DriverLicenseResponse>> getLicenses(@PathVariable UUID driverId) {
        return ResponseEntity.ok(credentialService.getLicensesByDriver(driverId));
    }

    @PutMapping("/api/drivers/licenses/{id}")
    public ResponseEntity<DriverLicenseResponse> updateLicense(
            @PathVariable Long id, @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.ok(credentialService.updateLicense(id, request));
    }

    @DeleteMapping("/api/drivers/licenses/{id}")
    public ResponseEntity<Void> deleteLicense(@PathVariable Long id) {
        credentialService.deleteLicense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/drivers/{driverId}/performance-scores")
    public ResponseEntity<List<DriverPerformanceScore>> getPerformanceScores(@PathVariable UUID driverId) {
        return ResponseEntity.ok(assessmentService.getScoresByDriver(driverId));
    }

    @GetMapping("/api/drivers/{driverId}/qualification")
    public ResponseEntity<QualificationCheckResponse> checkQualification(
            @PathVariable UUID driverId, @RequestParam String vehicleCategory) {
        return ResponseEntity.ok(credentialService.checkQualification(driverId, vehicleCategory));
    }

    @GetMapping("/api/drivers/{driverId}/readiness")
    public ResponseEntity<DriverReadinessCache> getReadiness(@PathVariable UUID driverId) {
        return ResponseEntity.ok(readinessService.getReadiness(driverId));
    }

    @GetMapping("/api/drivers/readiness/available")
    public ResponseEntity<List<DriverReadinessCache>> getAvailableReadyDrivers() {
        return ResponseEntity.ok(readinessService.getAvailableReadyDrivers());
    }

    @GetMapping("/api/drivers/readiness")
    public ResponseEntity<List<DriverReadinessCache>> getAllReadiness() {
        return ResponseEntity.ok(readinessService.getAllReadiness());
    }

    @PostMapping("/api/drivers/{driverId}/readiness/refresh")
    public ResponseEntity<DriverReadinessCache> refreshReadiness(@PathVariable UUID driverId) {
        return ResponseEntity.ok(readinessService.refreshForDriver(driverId));
    }
}
