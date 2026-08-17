package com.vfms.dsm.controller;

import com.vfms.dsm.dto.DriverRequests.*;
import com.vfms.dsm.dto.DriverResponses.*;
import com.vfms.dsm.entity.DriverAggregate.DriverCertification;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverLeave;
import com.vfms.dsm.service.DriverCredentialService;
import com.vfms.dsm.service.DriverRecordService;
import com.vfms.dsm.service.DriverService;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Driver Self-Service API — /api/driver/**
 *
 * All endpoints are secured to ROLE_DRIVER (see SecurityConfig).
 * The driverId is NEVER accepted from the client; it is always resolved
 * server-side from the authenticated user's email to prevent IDOR attacks.
 */
@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
public class DriverSelfController {

    private final DriverService driverService;
    private final DriverCredentialService credentialService;
    private final DriverRecordService recordService;

    // ── Profile ──────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<DriverResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(driverService.getMyProfile(user.getEmail()));
    }

    @PutMapping("/profile")
    public ResponseEntity<DriverResponse> updateMyProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverProfileUpdateRequest request) {
        return ResponseEntity.ok(driverService.updateMyProfile(user.getEmail(), request));
    }

    // ── Profile picture ───────────────────────────────────────────────────────

    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverDocument> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        DriverDocument doc = recordService.uploadMyDocument(
                user.getEmail(), file, DriverDocument.DocumentEntityType.PROFILE, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<Void> removeProfilePicture(@AuthenticationPrincipal User user) {
        driverService.removeProfilePicture(user.getEmail());
        return ResponseEntity.noContent().build();
    }

    // ── Licenses ─────────────────────────────────────────────────────────────

    @GetMapping("/licenses")
    public ResponseEntity<List<DriverLicenseResponse>> getMyLicenses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(credentialService.getMyLicenses(user.getEmail()));
    }

    @PostMapping("/licenses")
    public ResponseEntity<DriverLicenseResponse> addMyLicense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(credentialService.addMyLicense(user.getEmail(), request));
    }

    @PutMapping("/licenses/{id}")
    public ResponseEntity<DriverLicenseResponse> updateMyLicense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.ok(credentialService.updateMyLicense(user.getEmail(), id, request));
    }

    // ── Certifications ───────────────────────────────────────────────────────

    @GetMapping("/certifications")
    public ResponseEntity<List<DriverCertification>> getMyCertifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(credentialService.getMyCertifications(user.getEmail()));
    }

    @PostMapping("/certifications")
    public ResponseEntity<DriverCertification> addMyCertification(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverSelfCertificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(credentialService.addMyCertification(user.getEmail(), request));
    }

    // ── Documents ────────────────────────────────────────────────────────────

    @GetMapping("/documents")
    public ResponseEntity<List<DriverDocument>> getMyDocuments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recordService.getMyDocuments(user.getEmail()));
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverDocument> uploadDocument(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam DriverDocument.DocumentEntityType entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) String documentName) {
        DriverDocument doc = recordService.uploadMyDocument(user.getEmail(), file, entityType, entityId, documentName);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        recordService.deleteMyDocument(user.getEmail(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Infractions ──────────────────────────────────────────────────────────

    @GetMapping("/infractions")
    public ResponseEntity<List<DriverInfraction>> getMyInfractions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recordService.getMyInfractions(user.getEmail()));
    }

    // ── Trips (read-only stub — returns empty list until fleet module integration) ──

    @GetMapping("/trips")
    public ResponseEntity<List<?>> getMyTrips(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(List.of());
    }

    // ── Leave Requests ───────────────────────────────────────────────────────

    @GetMapping("/leave-requests")
    public ResponseEntity<List<DriverLeave>> getMyLeaveRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recordService.getMyLeaveRequests(user.getEmail()));
    }

    @PostMapping("/leave-requests")
    public ResponseEntity<DriverLeave> submitLeaveRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverSelfLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recordService.submitLeaveRequest(user.getEmail(), request));
    }

    @DeleteMapping("/leave-requests/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        recordService.deleteMyLeaveRequest(user.getEmail(), id);
        return ResponseEntity.noContent().build();
    }
}
