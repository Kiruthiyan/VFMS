package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.entity.*;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.mapper.DriverMapper;
import com.vfms.dsm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.exception.AuthorizationException;
import com.vfms.user.repository.UserRepository;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

/**
 * Self-service operations for authenticated drivers.
 * All methods derive the driverId from the caller's email so the frontend
 * never needs to supply a driverId — preventing IDOR vulnerabilities.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class DriverSelfService {

    private final UserRepository userRepository;
    private final DriverLicenseRepository licenseRepository;
    private final DriverCertificationRepository certRepository;
    private final DriverDocumentRepository documentRepository;
    private final DriverInfractionRepository infractionRepository;
    private final DriverLeaveRepository leaveRepository;
    private final DriverServiceRequestRepository serviceRequestRepository;
    private final DriverReadinessService readinessService;
    private final DriverMapper driverMapper;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    private static final List<String> ALLOWED_MIME_TYPES =
            List.of("application/pdf", "image/jpeg", "image/png", "image/webp");

    // ── Profile ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public DriverResponse getMyProfile(String email) {
        User user = resolveUser(email);
        return driverMapper.toResponse(user);
    }

    public DriverResponse updateMyProfile(String email, DriverProfileUpdateRequest request) {
        User user = resolveUser(email);
        // Only whitelisted fields are mutated; identity fields are never touched.
        if (request.getPhone() != null)                 user.setPhone(request.getPhone());
        if (request.getAddress() != null)               user.setAddress(request.getAddress());
        if (request.getEmergencyContactName() != null)  user.setEmergencyContactName(request.getEmergencyContactName());
        if (request.getEmergencyContactPhone() != null) user.setEmergencyContactPhone(request.getEmergencyContactPhone());
        userRepository.save(user);
        return getMyProfile(email);
    }

    // ── Licenses ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverLicenseResponse> getMyLicenses(String email) {
        User user = resolveUser(email);
        return licenseRepository.findByUser_IdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toLicenseResponse).toList();
    }

    public DriverLicenseResponse addMyLicense(String email, DriverLicenseRequest request) {
        User user = resolveUser(email);
        DriverLicense license = DriverLicense.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber())
                .category(request.getCategory())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .issuingAuthority(request.getIssuingAuthority())
                .isPrimary(Boolean.TRUE.equals(request.getIsPrimary()))
                .build();
        DriverLicense saved = licenseRepository.save(license);
        readinessService.refreshForDriver(user.getId());
        return toLicenseResponse(saved);
    }

    public DriverLicenseResponse updateMyLicense(String email, Long licenseId, DriverLicenseRequest request) {
        User user = resolveUser(email);
        DriverLicense license = licenseRepository.findById(licenseId)
                .orElseThrow(() -> new ResourceNotFoundException("License not found: " + licenseId));
        assertOwnership(license.getUser().getId(), user.getId(), "License");
        license.setLicenseNumber(request.getLicenseNumber());
        license.setCategory(request.getCategory());
        license.setIssueDate(request.getIssueDate());
        license.setExpiryDate(request.getExpiryDate());
        license.setIssuingAuthority(request.getIssuingAuthority());
        if (request.getIsPrimary() != null) license.setIsPrimary(request.getIsPrimary());
        readinessService.refreshForDriver(user.getId());
        return toLicenseResponse(licenseRepository.save(license));
    }

    // ── Certifications ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverCertification> getMyCertifications(String email) {
        User user = resolveUser(email);
        return certRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    public DriverCertification addMyCertification(String email, DriverSelfCertificationRequest request) {
        User user = resolveUser(email);
        DriverCertification cert = DriverCertification.builder()
                .user(user)
                .certType(request.getCertType())
                .certName(request.getCertName())
                .issuedBy(request.getIssuedBy())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .build();
        return certRepository.save(cert);
    }

    // ── Documents ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverDocument> getMyDocuments(String email) {
        User user = resolveUser(email);
        return documentRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public DriverDocument uploadMyDocument(String email, MultipartFile file,
                                           DriverDocument.DocumentEntityType entityType,
                                           Long entityId) throws IOException {
        User user = resolveUser(email);
        if (!ALLOWED_MIME_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed: " + file.getContentType());
        }
        String originalFilename = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + "_" + originalFilename;

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);
        Files.copy(file.getInputStream(), uploadPath.resolve(storedFilename), StandardCopyOption.REPLACE_EXISTING);

        DriverDocument doc = DriverDocument.builder()
                .user(user)
                .entityType(entityType)
                .entityId(entityId)
                .fileName(originalFilename)
                .fileUrl("/uploads/documents/" + storedFilename)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .build();

        DriverDocument saved = documentRepository.save(doc);
        if (entityType == DriverDocument.DocumentEntityType.PROFILE) {
            user.setPhotoUrl(doc.getFileUrl());
            userRepository.save(user);
        } else if (entityType == DriverDocument.DocumentEntityType.LICENSE) {
            readinessService.refreshForDriver(user.getId());
        }
        return saved;
    }

    public void removeProfilePicture(String email) {
        User user = resolveUser(email);
        user.setPhotoUrl(null);
        userRepository.save(user);
    }

    public void deleteMyDocument(String email, Long documentId) throws IOException {
        User user = resolveUser(email);
        DriverDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + documentId));
        assertOwnership(doc.getUser().getId(), user.getId(), "Document");

        String filename = Paths.get(doc.getFileUrl()).getFileName().toString();
        Files.deleteIfExists(Paths.get(uploadDir, filename));
        documentRepository.delete(doc);
        if (doc.getEntityType() == DriverDocument.DocumentEntityType.LICENSE) {
            readinessService.refreshForDriver(user.getId());
        }
    }

    // ── Infractions ──────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverInfraction> getMyInfractions(String email) {
        User user = resolveUser(email);
        return infractionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public DriverInfraction submitMyInfraction(String email, DriverSelfInfractionRequest request) {
        User user = resolveUser(email);
        DriverInfraction infraction = DriverInfraction.builder()
                .user(user)
                .infractionType(request.getInfractionType())
                .severity(request.getSeverity())
                .incidentDate(request.getIncidentDate())
                .description(request.getDescription())
                .penaltyNotes(request.getPenaltyNotes())
                .build();
        return infractionRepository.save(infraction);
    }

    // ── Leave Requests ───────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverLeave> getMyLeaveRequests(String email) {
        User user = resolveUser(email);
        return leaveRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public DriverLeave submitLeaveRequest(String email, DriverSelfLeaveRequest request) {
        User user = resolveUser(email);

        List<DriverLeave.LeaveStatus> excludedStatuses = List.of(
            DriverLeave.LeaveStatus.REJECTED, 
            DriverLeave.LeaveStatus.CANCELLED
        );
        if (leaveRepository.countOverlappingLeaves(user.getId(), request.getStartDate(), request.getEndDate(), excludedStatuses) > 0) {
            throw new ValidationException("Leave dates overlap with an existing request.");
        }

        DriverLeave leave = DriverLeave.builder()
                .user(user)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build();
        return leaveRepository.save(leave);
    }

    public void deleteMyLeaveRequest(String email, Long id) {
        User user = resolveUser(email);
        DriverLeave leave = leaveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
        assertOwnership(leave.getUser().getId(), user.getId(), "Leave Request");
        
        if (leave.getStatus() != DriverLeave.LeaveStatus.PENDING) {
            throw new ValidationException("Only pending leave requests can be deleted.");
        }
        
        leaveRepository.delete(leave);
    }

    // ── Service Requests ─────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverServiceRequest> getMyServiceRequests(String email) {
        User user = resolveUser(email);
        return serviceRequestRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    public DriverServiceRequest submitServiceRequest(String email, DriverSelfServiceRequestDto dto) {
        User user = resolveUser(email);
        DriverServiceRequest request = DriverServiceRequest.builder()
                .user(user)
                .vehicleId(dto.getVehicleId())
                .requestType(dto.getRequestType())
                .description(dto.getDescription())
                .urgency(dto.getUrgency() != null ? dto.getUrgency() : DriverServiceRequest.Urgency.MEDIUM)
                .build();
        return serviceRequestRepository.save(request);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Resolves the Driver record for the currently authenticated user.
     * Throws 404 if no driver profile is linked to that email.
     */
    public User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No driver profile found for the authenticated user. " +
                        "Please contact an administrator to link your driver record."));
    }

    private void assertOwnership(UUID ownerId, UUID requesterId, String resourceName) {
        if (!ownerId.equals(requesterId)) {
            throw new AuthorizationException("You do not have permission to access this " + resourceName + ".");
        }
    }

    private DriverLicenseResponse toLicenseResponse(DriverLicense license) {
        return DriverLicenseResponse.builder()
                .id(license.getId())
                .driverId(license.getUser() != null ? license.getUser().getId() : null)
                .licenseNumber(license.getLicenseNumber())
                .category(license.getCategory())
                .issueDate(license.getIssueDate())
                .expiryDate(license.getExpiryDate())
                .issuingAuthority(license.getIssuingAuthority())
                .isPrimary(license.getIsPrimary())
                .status(license.getStatus())
                .build();
    }
}
