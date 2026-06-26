package com.vfms.dsm.service;

import com.vfms.common.exception.AuthorizationException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.dsm.dto.DriverRequests.*;
import com.vfms.dsm.entity.DriverAggregate;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument.StorageProvider;
import com.vfms.dsm.entity.DriverAggregate.DriverInfraction;
import com.vfms.dsm.entity.DriverAggregate.DriverLeave;
import com.vfms.dsm.repository.DriverRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional
public class DriverRecordService {

    private final DriverRepository repository;
    private final DriverService driverService;
    private final DriverReadinessService readinessService;
    private final UserRepository userRepository;
    private final DriverSupabaseStorageService storageService;

    // ── Document upload (admin) ───────────────────────────────────────────────

    public DriverDocument uploadDocument(UUID driverId, MultipartFile file,
                                         DriverDocument.DocumentEntityType type, Long entityId) {
        DriverDocument saved = null;
        try {
            saved = storeFile(driverService.findById(driverId), file, type, entityId);
            if (type == DriverDocument.DocumentEntityType.LICENSE) readinessService.refreshForDriver(driverId);
            return withViewUrl(saved);
        } catch (RuntimeException e) {
            deleteUploadedObjectQuietly(saved);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<DriverDocument> getDocumentsByDriver(UUID id) {
        return withViewUrls(repository.findDocumentsByDriver(id));
    }

    @Transactional(readOnly = true)
    public DriverDocument getProfilePicture(UUID id) {
        List<DriverDocument> values = repository.findDocumentsByDriverAndType(id, DriverDocument.DocumentEntityType.PROFILE);
        return values.stream()
                .filter(storageService::isSupabaseDocument)
                .findFirst()
                .map(this::withViewUrl)
                .orElse(null);
    }

    public void deleteDocument(Long id) {
        DriverDocument doc = repository.findDocumentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        storageService.deleteObjectQuietly(doc.getBucketName(), doc.getStoragePath());
        repository.deleteDocument(doc);
        if (doc.getEntityType() == DriverDocument.DocumentEntityType.LICENSE && doc.getUser() != null)
            readinessService.refreshForDriver(doc.getUser().getId());
    }

    // ── Infractions ───────────────────────────────────────────────────────────

    public DriverInfraction logInfraction(InfractionRequest request) {
        return repository.saveInfraction(DriverInfraction.builder()
                .user(driverService.findById(request.getDriverId()))
                .infractionType(request.getInfractionType())
                .severity(request.getSeverity())
                .incidentDate(request.getIncidentDate())
                .description(request.getDescription())
                .penaltyNotes(request.getPenaltyNotes())
                .build());
    }

    @Transactional(readOnly = true)
    public List<DriverInfraction> getAllInfractions() { return repository.findAllInfractions(); }

    @Transactional(readOnly = true)
    public List<DriverInfraction> getInfractionsByDriver(UUID id) { return repository.findInfractionsByDriver(id); }

    @Transactional(readOnly = true)
    public List<DriverInfraction> getMyInfractions(String email) {
        return repository.findInfractionsByDriver(driverService.findByEmail(email).getId()).stream()
                .filter(i -> i.getResolutionStatus() != DriverInfraction.ResolutionStatus.RESOLVED)
                .toList();
    }

    public DriverInfraction resolveInfraction(Long id) {
        DriverInfraction value = repository.findInfractionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Infraction not found: " + id));
        value.setResolutionStatus(DriverInfraction.ResolutionStatus.RESOLVED);
        value.setResolvedAt(LocalDate.now());
        return repository.saveInfraction(value);
    }

    @Transactional(readOnly = true)
    public boolean hasBlockingInfractions(UUID id) {
        return repository.countUnresolvedInfractions(id, DriverInfraction.Severity.CRITICAL,
                DriverInfraction.ResolutionStatus.RESOLVED) > 0;
    }

    // ── Leaves ────────────────────────────────────────────────────────────────

    public DriverLeave requestLeave(LeaveRequest request) {
        return repository.saveLeave(DriverLeave.builder()
                .user(driverService.findById(request.getDriverId()))
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build());
    }

    public DriverLeave processLeave(Long id, LeaveApprovalRequest request, String approvedBy) {
        DriverLeave leave = repository.findLeaveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found: " + id));
        leave.setStatus(request.getStatus());
        leave.setApprovedBy(approvedBy);
        leave.setApprovalNotes(request.getApprovalNotes());
        return repository.saveLeave(leave);
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getLeavesByDriver(UUID id) { return repository.findLeavesByDriver(id); }

    @Transactional(readOnly = true)
    public List<DriverLeave> getAllLeaves() { return repository.findAllLeaves(); }

    @Transactional(readOnly = true)
    public List<DriverLeave> getPendingLeaves() { return repository.findLeavesByStatus(DriverLeave.LeaveStatus.PENDING); }

    @Transactional(readOnly = true)
    public List<DriverLeave> getLeavesByStatus(DriverLeave.LeaveStatus status) {
        return repository.findLeavesByStatus(status);
    }

    // ── Self-service documents ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverDocument> getMyDocuments(String email) {
        return withViewUrls(repository.findDocumentsByDriver(driverService.findByEmail(email).getId()));
    }

    public DriverDocument uploadMyDocument(String email, MultipartFile file,
                                           DriverDocument.DocumentEntityType type, Long entityId) {
        return uploadMyDocument(email, file, type, entityId, null);
    }

    public DriverDocument uploadMyDocument(String email, MultipartFile file,
                                           DriverDocument.DocumentEntityType type, Long entityId,
                                           String documentName) {
        if (type == DriverDocument.DocumentEntityType.OTHER && (documentName == null || documentName.isBlank())) {
            throw new ValidationException("Document name is required for Other documents.");
        }
        User user = driverService.findByEmail(email);
        List<DriverDocument> oldProfileDocuments = type == DriverDocument.DocumentEntityType.PROFILE
                ? repository.findDocumentsByDriverAndType(user.getId(), DriverDocument.DocumentEntityType.PROFILE)
                : List.of();
        DriverDocument saved = null;
        try {
            saved = storeFile(user, file, type, entityId, documentName);
            if (type == DriverDocument.DocumentEntityType.PROFILE) {
                // Profile picture is always served via Supabase signed URL — clear any legacy photoUrl.
                user.setPhotoUrl(null);
                userRepository.save(user);
                // Delete any previous profile pictures from Supabase.
                for (DriverDocument old : oldProfileDocuments) {
                    storageService.deleteObjectQuietly(old.getBucketName(), old.getStoragePath());
                    repository.deleteDocument(old);
                }
            } else if (type == DriverDocument.DocumentEntityType.LICENSE) {
                readinessService.refreshForDriver(user.getId());
            }
            return withViewUrl(saved);
        } catch (RuntimeException e) {
            deleteUploadedObjectQuietly(saved);
            throw e;
        }
    }

    public void deleteMyDocument(String email, Long id) {
        User user = driverService.findByEmail(email);
        DriverDocument doc = repository.findDocumentById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        assertOwner(doc.getUser().getId(), user.getId(), "Document");
        storageService.deleteObjectQuietly(doc.getBucketName(), doc.getStoragePath());
        repository.deleteDocument(doc);
        if (doc.getEntityType() == DriverDocument.DocumentEntityType.LICENSE)
            readinessService.refreshForDriver(user.getId());
    }

    // ── Self-service leave requests ───────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DriverLeave> getMyLeaveRequests(String email) {
        return repository.findLeavesByDriver(driverService.findByEmail(email).getId());
    }

    public DriverLeave submitLeaveRequest(String email, DriverSelfLeaveRequest request) {
        User user = driverService.findByEmail(email);
        List<DriverLeave.LeaveStatus> excluded = List.of(DriverLeave.LeaveStatus.REJECTED, DriverLeave.LeaveStatus.CANCELLED);
        if (repository.countOverlappingLeaves(user.getId(), request.getStartDate(), request.getEndDate(), excluded) > 0)
            throw new ValidationException("Leave dates overlap with an existing request.");
        return repository.saveLeave(DriverLeave.builder()
                .user(user)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build());
    }

    public void deleteMyLeaveRequest(String email, Long id) {
        User user = driverService.findByEmail(email);
        DriverLeave leave = repository.findLeaveById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave request not found: " + id));
        assertOwner(leave.getUser().getId(), user.getId(), "Leave Request");
        if (leave.getStatus() != DriverLeave.LeaveStatus.PENDING)
            throw new ValidationException("Only pending leave requests can be deleted.");
        repository.deleteLeave(leave);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private DriverDocument storeFile(User user, MultipartFile file,
                                     DriverDocument.DocumentEntityType type, Long entityId) {
        return storeFile(user, file, type, entityId, null);
    }

    private DriverDocument storeFile(User user, MultipartFile file,
                                     DriverDocument.DocumentEntityType type, Long entityId,
                                     String documentName) {
        String original = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String displayName = documentName == null || documentName.isBlank() ? original : documentName.trim();
        DriverSupabaseStorageService.StoredObject stored = storageService.uploadDriverFile(user.getId(), type, file);
        try {
            return repository.saveDocument(DriverDocument.builder()
                    .user(user)
                    .entityType(type)
                    .entityId(entityId)
                    .fileName(displayName)
                    .fileUrl(null)
                    .originalFileName(original)
                    .bucketName(stored.bucketName())
                    .storagePath(stored.storagePath())
                    .storageProvider(StorageProvider.SUPABASE)
                    .mimeType(file.getContentType())
                    .fileSize(file.getSize())
                    .uploadedAt(LocalDateTime.now())
                    .build());
        } catch (RuntimeException e) {
            storageService.deleteObjectQuietly(stored.bucketName(), stored.storagePath());
            throw e;
        }
    }

    private DriverDocument withViewUrl(DriverDocument document) {
        if (document == null) return null;
        if (!storageService.isSupabaseDocument(document)) {
            throw new ResourceNotFoundException("Driver document is not stored in Supabase Storage.");
        }
        document.setStorageProvider(StorageProvider.SUPABASE);
        try {
            document.setFileUrl(storageService.createSignedUrl(document.getBucketName(), document.getStoragePath()));
        } catch (ValidationException | ResourceNotFoundException e) {
            log.warn("Driver document access link could not be created: driverId={}, documentId={}, bucket={}, path={}, reason={}",
                    document.getUser() != null ? document.getUser().getId() : null,
                    document.getId(),
                    document.getBucketName(),
                    document.getStoragePath(),
                    e.getMessage());
            document.setFileUrl(null);
        }
        return document;
    }

    private List<DriverDocument> withViewUrls(List<DriverDocument> documents) {
        return documents.stream()
                .filter(storageService::isSupabaseDocument)
                .map(this::withViewUrl)
                .toList();
    }

    private void deleteUploadedObjectQuietly(DriverDocument document) {
        if (document != null) {
            storageService.deleteObjectQuietly(document.getBucketName(), document.getStoragePath());
        }
    }

    private void assertOwner(UUID owner, UUID requester, String resource) {
        if (!owner.equals(requester))
            throw new AuthorizationException("You do not have permission to access this " + resource + ".");
    }
}
