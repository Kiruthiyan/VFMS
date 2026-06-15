package com.vfms.dsm.controller;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.*;
import com.vfms.dsm.service.DriverSelfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.vfms.user.entity.User;

import java.io.IOException;
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

    private final DriverSelfService selfService;

    // ── Profile ──────────────────────────────────────────────────────────────

    @GetMapping("/profile")
    public ResponseEntity<DriverResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyProfile(user.getEmail()));
    }

    @PutMapping("/profile")
    public ResponseEntity<DriverResponse> updateMyProfile(
            @AuthenticationPrincipal User user,
            @RequestBody DriverProfileUpdateRequest request) {
        return ResponseEntity.ok(selfService.updateMyProfile(user.getEmail(), request));
    }

    // ── Profile picture ───────────────────────────────────────────────────────

    @PostMapping(value = "/profile/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverDocument> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) throws IOException {
        DriverDocument doc = selfService.uploadMyDocument(
                user.getEmail(), file, DriverDocument.DocumentEntityType.PROFILE, null);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/profile/picture")
    public ResponseEntity<Void> removeProfilePicture(@AuthenticationPrincipal User user) {
        selfService.removeProfilePicture(user.getEmail());
        return ResponseEntity.noContent().build();
    }

    // ── Licenses ─────────────────────────────────────────────────────────────

    @GetMapping("/licenses")
    public ResponseEntity<List<DriverLicenseResponse>> getMyLicenses(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyLicenses(user.getEmail()));
    }

    @PostMapping("/licenses")
    public ResponseEntity<DriverLicenseResponse> addMyLicense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(selfService.addMyLicense(user.getEmail(), request));
    }

    @PutMapping("/licenses/{id}")
    public ResponseEntity<DriverLicenseResponse> updateMyLicense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody DriverLicenseRequest request) {
        return ResponseEntity.ok(selfService.updateMyLicense(user.getEmail(), id, request));
    }

    // ── Certifications ───────────────────────────────────────────────────────

    @GetMapping("/certifications")
    public ResponseEntity<List<DriverCertification>> getMyCertifications(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyCertifications(user.getEmail()));
    }

    @PostMapping("/certifications")
    public ResponseEntity<DriverCertification> addMyCertification(
            @AuthenticationPrincipal User user,
            @RequestBody com.vfms.dsm.dto.DriverSelfCertificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(selfService.addMyCertification(user.getEmail(), request));
    }

    // ── Documents ────────────────────────────────────────────────────────────

    @GetMapping("/documents")
    public ResponseEntity<List<DriverDocument>> getMyDocuments(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyDocuments(user.getEmail()));
    }

    @PostMapping(value = "/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DriverDocument> uploadDocument(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestParam DriverDocument.DocumentEntityType entityType,
            @RequestParam(required = false) Long entityId) throws IOException {
        DriverDocument doc = selfService.uploadMyDocument(user.getEmail(), file, entityType, entityId);
        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteDocument(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) throws IOException {
        selfService.deleteMyDocument(user.getEmail(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Infractions ──────────────────────────────────────────────────────────

    @GetMapping("/infractions")
    public ResponseEntity<List<DriverInfraction>> getMyInfractions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyInfractions(user.getEmail()));
    }

    @PostMapping("/infractions")
    public ResponseEntity<DriverInfraction> submitInfraction(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody com.vfms.dsm.dto.DriverSelfInfractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(selfService.submitMyInfraction(user.getEmail(), request));
    }

    // ── Trips (read-only; stub returns empty list if no trip module present) ──

    @GetMapping("/trips")
    public ResponseEntity<List<?>> getMyTrips(@AuthenticationPrincipal User user) {
        // Trip data is managed by a separate fleet module.
        // This endpoint is kept as a placeholder and returns an empty list
        // until the fleet trip module is integrated with the driver portal.
        return ResponseEntity.ok(List.of());
    }

    // ── Leave Requests ───────────────────────────────────────────────────────

    @GetMapping("/leave-requests")
    public ResponseEntity<List<DriverLeave>> getMyLeaveRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyLeaveRequests(user.getEmail()));
    }

    @PostMapping("/leave-requests")
    public ResponseEntity<DriverLeave> submitLeaveRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody com.vfms.dsm.dto.DriverSelfLeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(selfService.submitLeaveRequest(user.getEmail(), request));
    }

    @DeleteMapping("/leave-requests/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        selfService.deleteMyLeaveRequest(user.getEmail(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Service Requests ─────────────────────────────────────────────────────

    @GetMapping("/service-requests")
    public ResponseEntity<List<DriverServiceRequest>> getMyServiceRequests(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(selfService.getMyServiceRequests(user.getEmail()));
    }

    @PostMapping("/service-requests")
    public ResponseEntity<DriverServiceRequest> submitServiceRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody DriverSelfServiceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(selfService.submitServiceRequest(user.getEmail(), dto));
    }
}
