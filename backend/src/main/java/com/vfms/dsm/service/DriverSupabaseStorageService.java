package com.vfms.dsm.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.dsm.config.DriverSupabaseStorageProperties;
import com.vfms.dsm.entity.DriverAggregate.DriverDocument;
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

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DriverSupabaseStorageService {

    private static final long MAX_FILE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Set<String> ALLOWED_PROFILE_PICTURE_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS_BY_TYPE = Map.of(
            "application/pdf", Set.of("pdf"),
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/png", Set.of("png"),
            "image/webp", Set.of("webp")
    );

    private final DriverSupabaseStorageProperties properties;
    private final RestTemplate restTemplate;

    public StoredObject uploadDriverFile(UUID driverId, DriverDocument.DocumentEntityType type, MultipartFile file) {
        validateFile(file, type);
        requireConfigured();

        String extension = extensionFor(file);
        String objectPath = objectPath(driverId, type, extension);
        String uploadUrl = storageUrl() + "/object/" + properties.getBucket() + "/" + objectPath;

        // Bug 4 fix: read bytes before the HTTP try-block so IOException surfaces
        // with a clear diagnostic instead of being swallowed by the generic catch.
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (java.io.IOException e) {
            log.error("Driver storage upload failed — could not read file bytes: driverId={}, type={}, error={}",
                    driverId, type, e.getMessage(), e);
            throw new ValidationException("Could not read the uploaded file. Please try again.", e);
        }

        try {
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            restTemplate.exchange(uploadUrl, HttpMethod.POST, new HttpEntity<>(fileBytes, headers), String.class);
            log.info("Driver storage upload succeeded: driverId={}, bucket={}, path={}, type={}",
                    driverId, properties.getBucket(), objectPath, type);
            return new StoredObject(properties.getBucket(), objectPath);
        } catch (Exception e) {
            log.error("Driver storage upload failed: driverId={}, bucket={}, path={}, type={}, error={}",
                    driverId, properties.getBucket(), objectPath, type, e.getMessage(), e);
            throw new ValidationException("Failed to upload driver file. Please try again.", e);
        }
    }

    public void deleteObjectQuietly(String bucketName, String storagePath) {
        try {
            deleteObject(bucketName, storagePath);
        } catch (RuntimeException ignored) {
            // deleteObject already logs bucket/path/error; callers use this for compensation cleanup
        }
    }

    public void deleteObject(String bucketName, String storagePath) {
        if (isBlank(bucketName) || isBlank(storagePath)) return;
        requireConfigured();

        try {
            // Supabase Storage REST API for deleting files:
            // DELETE /storage/v1/object/{bucketName}
            // Body: {"prefixes": ["path/to/file"]}
            String deleteUrl = storageUrl() + "/object/" + bucketName;
            
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, List<String>> body = Map.of("prefixes", List.of(storagePath));
            HttpEntity<Map<String, List<String>>> request = new HttpEntity<>(body, headers);
            
            // RestTemplate doesn't support body with HttpMethod.DELETE natively, 
            // but exchange() bypasses this restriction for modern implementations
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, request, String.class);
            log.info("Driver storage delete succeeded: bucket={}, path={}", bucketName, storagePath);
        } catch (Exception e) {
            log.warn("Driver storage delete failed: bucket={}, path={}, error={}", bucketName, storagePath, e.getMessage());
            throw new ValidationException("Failed to delete driver file from storage. Please try again.", e);
        }
    }

    public String createSignedUrl(String bucketName, String storagePath) {
        if (isBlank(bucketName) || isBlank(storagePath)) return null;
        requireConfigured();

        try {
            String signUrl = storageUrl() + "/object/sign/" + bucketName + "/" + storagePath;
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
            // Bug 6 fix: Supabase Storage v2 returns "signedUrl" (lowercase l);
            // older/v1 returns "signedURL". Accept both defensively.
            Object signedUrl = response == null ? null :
                    response.getOrDefault("signedUrl", response.get("signedURL"));
            if (!(signedUrl instanceof String signedPath) || signedPath.isBlank()) {
                throw new ValidationException("Could not create document access link.");
            }
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) return signedPath;
            return storageUrl() + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
        } catch (ValidationException | ResourceNotFoundException e) {
            throw e;
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Stored driver file was not found.");
            }
            log.warn("Driver storage signed URL failed: bucket={}, path={}, status={}",
                    bucketName, storagePath, e.getStatusCode().value());
            throw new ValidationException("Could not create document access link. Please try again.", e);
        } catch (Exception e) {
            log.warn("Driver storage signed URL failed: bucket={}, path={}, error={}",
                    bucketName, storagePath, e.getMessage());
            throw new ValidationException("Could not create document access link. Please try again.", e);
        }
    }

    public boolean isSupabaseDocument(DriverDocument document) {
        return document != null && !isBlank(document.getBucketName()) && !isBlank(document.getStoragePath());
    }

    public String defaultBucket() {
        return properties.getBucket();
    }

    private String objectPath(UUID driverId, DriverDocument.DocumentEntityType type, String extension) {
        String folder = type == DriverDocument.DocumentEntityType.PROFILE
                ? "profile"
                : "documents/" + type.name().toLowerCase(Locale.ROOT);
        return "drivers/" + driverId + "/" + folder + "/" + UUID.randomUUID() + "." + extension;
    }

    private void validateFile(MultipartFile file, DriverDocument.DocumentEntityType type) {
        boolean profilePicture = type == DriverDocument.DocumentEntityType.PROFILE;
        if (file == null || file.isEmpty()) {
            throw new ValidationException(profilePicture ? "Profile picture file is required." : "Document file is required.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new ValidationException(
                    profilePicture ? "Profile picture file is too large." : "Document file is too large.",
                    Map.of("file", profilePicture ? "Profile picture must be 5 MB or smaller." : "Document must be 5 MB or smaller.")
            );
        }

        validateSafeOriginalFilename(file.getOriginalFilename(), profilePicture);

        String contentType = file.getContentType();
        String normalizedContentType = contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
        Set<String> allowedTypes = profilePicture ? ALLOWED_PROFILE_PICTURE_CONTENT_TYPES : ALLOWED_CONTENT_TYPES;
        if (!allowedTypes.contains(normalizedContentType)) {
            throw new ValidationException(
                    profilePicture ? "Invalid profile picture file type." : "Invalid document file type.",
                    Map.of("file", profilePicture
                            ? "Profile picture must be a JPEG, PNG, or WebP image."
                            : "Document must be a PDF, JPEG, PNG, or WebP file.")
            );
        }

        String extension = extensionFor(file);
        if (!ALLOWED_EXTENSIONS_BY_TYPE.get(normalizedContentType).contains(extension)) {
            throw new ValidationException(
                    profilePicture ? "Invalid profile picture file extension." : "Invalid document file extension.",
                    Map.of("file", profilePicture
                            ? "Profile picture extension does not match the uploaded image type."
                            : "Document extension does not match the uploaded file type.")
            );
        }
    }

    private String extensionFor(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new ValidationException("Document file extension is required.");
        }
        String extension = original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        if (extension.isBlank() || extension.contains("/") || extension.contains("\\")) {
            throw new ValidationException("Invalid document file extension.");
        }
        return extension;
    }

    private void validateSafeOriginalFilename(String original, boolean profilePicture) {
        if (original == null || original.isBlank()) {
            throw new ValidationException(profilePicture ? "Profile picture file name is required." : "Document original file name is required.");
        }
        if (original.contains("/") || original.contains("\\") || original.contains("..")) {
            throw new ValidationException(profilePicture ? "Unsafe profile picture file name." : "Unsafe document file name.");
        }
    }

    private void requireConfigured() {
        if (!isConfigured()) {
            throw new ValidationException("Driver Supabase storage is not configured.");
        }
    }

    private boolean isConfigured() {
        return !isBlank(properties.getStorageUrl())
                && !isBlank(properties.getBucket())
                && !isBlank(properties.getServiceKey());
    }

    private HttpHeaders authHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(properties.getServiceKey());
        // Bug 1 fix: Supabase Storage REST API requires BOTH the Authorization
        // Bearer token AND the apikey header on every request.
        headers.set("apikey", properties.getServiceKey());
        return headers;
    }

    private String storageUrl() {
        return properties.getStorageUrl().replaceAll("/+$", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record StoredObject(String bucketName, String storagePath) {}
}
