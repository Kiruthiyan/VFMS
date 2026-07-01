package com.vfms.fleet.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.fleet.config.FleetSupabaseStorageProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FleetDocumentStorageService {

    private static final String SUPABASE_REF_PREFIX = "supabase://";
    private static final long MAX_FILE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("application/pdf");

    private final FleetSupabaseStorageProperties properties;
    private final RestTemplate restTemplate;

    public String uploadMaintenanceDocument(Long requestId, String documentType, MultipartFile file) {
        StoredObject storedObject = uploadDocument("maintenance", requestId, documentType, file);
        return toStorageReference(storedObject);
    }

    public String uploadRentalDocument(Long rentalId, String documentType, MultipartFile file) {
        StoredObject storedObject = uploadDocument("rentals", rentalId, documentType, file);
        return toStorageReference(storedObject);
    }

    public String createSignedUrlForMaintenance(String reference) {
        return createSignedUrlFromReference(reference, "maintenance/");
    }

    public String createSignedUrlForRental(String reference) {
        return createSignedUrlFromReference(reference, "rentals/");
    }

    public boolean isSupabaseReference(String value) {
        return parseReference(value) != null;
    }

    private StoredObject uploadDocument(String module, Long ownerId, String documentType, MultipartFile file) {
        validatePdf(file);
        requireConfigured();

        String objectPath = objectPath(module, ownerId, documentType, file.getOriginalFilename());
        String uploadUrl = storageUrl() + "/object/" + properties.getBucket() + "/" + objectPath;

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            log.error("Fleet document upload failed - could not read file bytes: module={}, ownerId={}, type={}, error={}",
                    module, ownerId, documentType, e.getMessage(), e);
            throw new ValidationException("Could not read the uploaded document. Please try again.", e);
        }

        try {
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            restTemplate.exchange(uploadUrl, HttpMethod.POST, new HttpEntity<>(fileBytes, headers), String.class);
            log.info("Fleet document upload succeeded: bucket={}, path={}", properties.getBucket(), objectPath);
            return new StoredObject(properties.getBucket(), objectPath);
        } catch (Exception e) {
            log.error("Fleet document upload failed: bucket={}, path={}, error={}",
                    properties.getBucket(), objectPath, e.getMessage(), e);
            throw new ValidationException("Failed to upload document. Please try again.", e);
        }
    }

    private String createSignedUrlFromReference(String reference, String expectedPathPrefix) {
        StoredObject storedObject = parseReference(reference);
        if (storedObject == null) {
            throw new ValidationException("Invalid document storage reference.");
        }
        requireConfigured();

        if (!properties.getBucket().equals(storedObject.bucketName())) {
            throw new ValidationException("Document belongs to an unexpected storage bucket.");
        }
        if (!storedObject.storagePath().startsWith(expectedPathPrefix)) {
            throw new ValidationException("Document reference is not allowed for this module.");
        }

        try {
            String signUrl = storageUrl() + "/object/sign/" + storedObject.bucketName() + "/" + storedObject.storagePath();
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, Long> body = Map.of("expiresIn", properties.getSignedUrlTtlSeconds());
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.exchange(
                    signUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    Map.class
            ).getBody();

            Object signedUrl = response == null ? null :
                    response.getOrDefault("signedUrl", response.get("signedURL"));
            if (!(signedUrl instanceof String signedPath) || signedPath.isBlank()) {
                throw new ValidationException("Could not create document access link.");
            }
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
                return signedPath;
            }
            return storageUrl() + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
        } catch (ValidationException | ResourceNotFoundException e) {
            throw e;
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Stored fleet document was not found.");
            }
            log.warn("Fleet document signed URL failed: bucket={}, path={}, status={}",
                    storedObject.bucketName(), storedObject.storagePath(), e.getStatusCode().value());
            throw new ValidationException("Could not create document access link. Please try again.", e);
        } catch (Exception e) {
            log.warn("Fleet document signed URL failed: bucket={}, path={}, error={}",
                    storedObject.bucketName(), storedObject.storagePath(), e.getMessage());
            throw new ValidationException("Could not create document access link. Please try again.", e);
        }
    }

    private String toStorageReference(StoredObject storedObject) {
        return SUPABASE_REF_PREFIX + storedObject.bucketName() + "/" + storedObject.storagePath();
    }

    private StoredObject parseReference(String value) {
        if (value == null || value.isBlank() || !value.startsWith(SUPABASE_REF_PREFIX)) {
            return null;
        }

        String ref = value.substring(SUPABASE_REF_PREFIX.length());
        int separator = ref.indexOf('/');
        if (separator <= 0 || separator == ref.length() - 1) {
            return null;
        }

        return new StoredObject(ref.substring(0, separator), ref.substring(separator + 1));
    }

    private String objectPath(String module, Long ownerId, String documentType, String originalName) {
        return module + "/" + ownerId + "/" + documentType + "/" + UUID.randomUUID() + "_" + safeFileName(originalName);
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Document file is required.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new ValidationException(
                    "Document file is too large.",
                    Map.of("file", "Document must be 5 MB or smaller.")
            );
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new ValidationException("Document original file name is required.");
        }
        if (originalName.contains("/") || originalName.contains("\\") || originalName.contains("..")) {
            throw new ValidationException("Unsafe document file name.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ValidationException(
                    "Invalid document file type.",
                    Map.of("file", "Document must be a PDF file.")
            );
        }
        if (!originalName.toLowerCase(Locale.ROOT).endsWith(".pdf")) {
            throw new ValidationException(
                    "Invalid document file extension.",
                    Map.of("file", "Document extension must be .pdf.")
            );
        }
    }

    private String safeFileName(String originalName) {
        String sanitized = originalName.replaceAll("[^A-Za-z0-9._-]", "_");
        if (sanitized.isBlank() || ".".equals(sanitized) || "..".equals(sanitized)) {
            return "document.pdf";
        }
        if (sanitized.length() <= 120) {
            return sanitized;
        }

        String extension = ".pdf";
        String baseName = sanitized.substring(0, sanitized.length() - extension.length());
        return baseName.substring(0, Math.min(baseName.length(), 120 - extension.length())) + extension;
    }

    private void requireConfigured() {
        if (isBlank(properties.getStorageUrl()) || isBlank(properties.getBucket()) || isBlank(properties.getServiceKey())) {
            throw new ValidationException("Fleet Supabase storage is not configured.");
        }
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(properties.getServiceKey());
        headers.set("apikey", properties.getServiceKey());
        return headers;
    }

    private String storageUrl() {
        return properties.getStorageUrl().replaceAll("/+$", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private record StoredObject(String bucketName, String storagePath) {}
}
