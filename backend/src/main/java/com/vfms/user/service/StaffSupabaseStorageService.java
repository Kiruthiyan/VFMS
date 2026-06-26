package com.vfms.user.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.user.config.StaffSupabaseStorageProperties;
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
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StaffSupabaseStorageService {

    private static final String SUPABASE_REF_PREFIX = "supabase://";
    private static final long MAX_FILE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS_BY_TYPE = Map.of(
            "image/jpeg", Set.of("jpg", "jpeg"),
            "image/png", Set.of("png"),
            "image/webp", Set.of("webp")
    );

    private final StaffSupabaseStorageProperties properties;
    private final RestTemplate restTemplate;

    public StoredObject uploadProfilePicture(UUID staffId, MultipartFile file) {
        validateFile(file);
        requireConfigured();

        String extension = extensionFor(file);
        String objectPath = "staff/" + staffId + "/profile/" + UUID.randomUUID() + "." + extension;
        String uploadUrl = storageUrl() + "/object/" + properties.getBucket() + "/" + objectPath;

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            log.error("Staff profile storage upload failed - could not read file bytes: staffId={}, error={}",
                    staffId, e.getMessage(), e);
            throw new ValidationException("Could not read the uploaded profile picture. Please try again.", e);
        }

        try {
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            restTemplate.exchange(uploadUrl, HttpMethod.POST, new HttpEntity<>(fileBytes, headers), String.class);
            log.info("Staff profile storage upload succeeded: staffId={}, bucket={}, path={}",
                    staffId, properties.getBucket(), objectPath);
            return new StoredObject(properties.getBucket(), objectPath);
        } catch (Exception e) {
            log.error("Staff profile storage upload failed: staffId={}, bucket={}, path={}, error={}",
                    staffId, properties.getBucket(), objectPath, e.getMessage(), e);
            throw new ValidationException("Failed to upload staff profile picture. Please try again.", e);
        }
    }

    public String toStorageReference(StoredObject storedObject) {
        return SUPABASE_REF_PREFIX + storedObject.bucketName() + "/" + storedObject.storagePath();
    }

    public String createSignedUrlFromReference(String photoUrl) {
        StoredObject storedObject = parseReference(photoUrl);
        if (storedObject == null) {
            return photoUrl;
        }
        return createSignedUrl(storedObject.bucketName(), storedObject.storagePath());
    }

    public void deleteObjectForReferenceQuietly(String photoUrl) {
        StoredObject storedObject = parseReference(photoUrl);
        if (storedObject == null) {
            return;
        }
        try {
            deleteObject(storedObject.bucketName(), storedObject.storagePath());
        } catch (RuntimeException ignored) {
            // deleteObject already logs bucket/path/error; callers should not fail profile updates on cleanup.
        }
    }

    public boolean isSupabaseReference(String photoUrl) {
        return parseReference(photoUrl) != null;
    }

    private String createSignedUrl(String bucketName, String storagePath) {
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
            Object signedUrl = response == null ? null :
                    response.getOrDefault("signedUrl", response.get("signedURL"));
            if (!(signedUrl instanceof String signedPath) || signedPath.isBlank()) {
                throw new ValidationException("Could not create staff profile picture access link.");
            }
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
                return signedPath;
            }
            return storageUrl() + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
        } catch (ValidationException | ResourceNotFoundException e) {
            throw e;
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Stored staff profile picture was not found.");
            }
            log.warn("Staff profile storage signed URL failed: bucket={}, path={}, status={}",
                    bucketName, storagePath, e.getStatusCode().value());
            throw new ValidationException("Could not create staff profile picture access link. Please try again.", e);
        } catch (Exception e) {
            log.warn("Staff profile storage signed URL failed: bucket={}, path={}, error={}",
                    bucketName, storagePath, e.getMessage());
            throw new ValidationException("Could not create staff profile picture access link. Please try again.", e);
        }
    }

    private void deleteObject(String bucketName, String storagePath) {
        requireConfigured();

        try {
            String deleteUrl = storageUrl() + "/object/" + bucketName;
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, List<String>> body = Map.of("prefixes", List.of(storagePath));
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(body, headers), String.class);
            log.info("Staff profile storage delete succeeded: bucket={}, path={}", bucketName, storagePath);
        } catch (Exception e) {
            log.warn("Staff profile storage delete failed: bucket={}, path={}, error={}",
                    bucketName, storagePath, e.getMessage());
            throw new ValidationException("Failed to delete staff profile picture from storage. Please try again.", e);
        }
    }

    private StoredObject parseReference(String photoUrl) {
        if (photoUrl == null || photoUrl.isBlank() || !photoUrl.startsWith(SUPABASE_REF_PREFIX)) {
            return null;
        }
        String value = photoUrl.substring(SUPABASE_REF_PREFIX.length());
        int separator = value.indexOf('/');
        if (separator <= 0 || separator == value.length() - 1) {
            return null;
        }
        return new StoredObject(value.substring(0, separator), value.substring(separator + 1));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Profile picture file is required.");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new ValidationException(
                    "Profile picture is too large.",
                    Map.of("file", "Profile picture must be 5 MB or smaller.")
            );
        }

        validateSafeOriginalFilename(file.getOriginalFilename());

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ValidationException(
                    "Invalid profile picture file type.",
                    Map.of("file", "Profile picture must be a JPEG, PNG, or WebP image.")
            );
        }

        String extension = extensionFor(file);
        if (!ALLOWED_EXTENSIONS_BY_TYPE.get(contentType.toLowerCase(Locale.ROOT)).contains(extension)) {
            throw new ValidationException(
                    "Invalid profile picture file extension.",
                    Map.of("file", "Profile picture extension does not match the uploaded file type.")
            );
        }
    }

    private String extensionFor(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original == null || !original.contains(".")) {
            throw new ValidationException("Profile picture file extension is required.");
        }
        String extension = original.substring(original.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
        if (extension.isBlank() || extension.contains("/") || extension.contains("\\")) {
            throw new ValidationException("Invalid profile picture file extension.");
        }
        return extension;
    }

    private void validateSafeOriginalFilename(String original) {
        if (original == null || original.isBlank()) {
            throw new ValidationException("Profile picture original file name is required.");
        }
        if (original.contains("/") || original.contains("\\") || original.contains("..")) {
            throw new ValidationException("Unsafe profile picture file name.");
        }
    }

    private void requireConfigured() {
        if (isBlank(properties.getStorageUrl()) || isBlank(properties.getBucket()) || isBlank(properties.getServiceKey())) {
            throw new ValidationException("Staff Supabase storage is not configured.");
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

    public record StoredObject(String bucketName, String storagePath) {}
}
