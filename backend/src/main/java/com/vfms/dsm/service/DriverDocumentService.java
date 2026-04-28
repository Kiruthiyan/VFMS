package com.vfms.dsm.service;

import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverDocument;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverDocumentService {
    private final DriverDocumentRepository documentRepository;
    private final DriverService driverService;
    private final DriverReadinessService readinessService;

    @Value("${app.upload.dir:uploads/documents}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of("application/pdf", "image/jpeg", "image/png");

    public DriverDocument uploadDocument(UUID driverId, MultipartFile file, DriverDocument.DocumentEntityType entityType, Long entityId) throws IOException {
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("File type not allowed: " + file.getContentType());
        }

        Driver driver = driverService.findById(driverId);
        String originalFilename = file.getOriginalFilename() == null ? "document" : file.getOriginalFilename();
        String filename = UUID.randomUUID() + "_" + originalFilename;

        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        DriverDocument doc = DriverDocument.builder()
                .driver(driver)
                .entityType(entityType)
                .entityId(entityId)
                .fileName(originalFilename)
                .fileUrl("/uploads/documents/" + filename)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .build();

            DriverDocument saved = documentRepository.save(doc);
            if (entityType == DriverDocument.DocumentEntityType.LICENSE) {
                readinessService.refreshForDriver(driverId);
            }
            return saved;
    }

    @Transactional(readOnly = true)
    public List<DriverDocument> getDocumentsByDriver(UUID driverId) {
        return documentRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    public void deleteDocument(Long id) throws IOException {
        DriverDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));

        String filename = Paths.get(doc.getFileUrl()).getFileName().toString();
        Path filePath = Paths.get(uploadDir, filename);
        Files.deleteIfExists(filePath);

        documentRepository.delete(doc);
        if (doc.getEntityType() == DriverDocument.DocumentEntityType.LICENSE && doc.getDriver() != null) {
            readinessService.refreshForDriver(doc.getDriver().getId());
        }
    }
}
