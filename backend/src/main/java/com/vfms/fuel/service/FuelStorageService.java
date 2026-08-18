package com.vfms.fuel.service;

import com.vfms.common.exception.ValidationException;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.fuel.config.SupabaseStorageConfig;
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
import java.io.InputStream;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuelStorageService {

    private static final String RECEIPT_PREFIX = "receipts/";
    private static final long MAX_RECEIPT_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            ".jpg",
            ".jpeg",
            ".png",
            ".webp",
            ".pdf"
    );

    private final SupabaseStorageConfig config;
    private final RestTemplate restTemplate;

    public String uploadReceipt(MultipartFile file) {
        validateReceipt(file);

        try {
            requireConfigured();

            String safeName = sanitizeFilename(file.getOriginalFilename());
            String fileName = RECEIPT_PREFIX + UUID.randomUUID() + "_" + safeName;
            String uploadUrl = normalizedStorageUrl()
                    + "/object/"
                    + config.getBucket()
                    + "/"
                    + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getServiceKey());
            headers.set("apikey", config.getServiceKey());
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            return fileName;
        } catch (ValidationException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("Failed to upload receipt: {}", e.getMessage(), e);
            throw new ValidationException("Failed to upload receipt. Please try again.", e);
        }
    }

    public String createSignedReceiptUrl(String storedReference) {
        requireConfigured();

        String objectPath = resolveReceiptObjectPath(storedReference);
        if (objectPath == null || !objectPath.startsWith(RECEIPT_PREFIX)) {
            throw new ValidationException("Invalid receipt storage reference.");
        }

        try {
            String signUrl = normalizedStorageUrl()
                    + "/object/sign/"
                    + config.getBucket()
                    + "/"
                    + objectPath;

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(config.getServiceKey());
            headers.set("apikey", config.getServiceKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.exchange(
                    signUrl,
                    HttpMethod.POST,
                    new HttpEntity<>(Map.of("expiresIn", config.getSignedUrlTtlSeconds()), headers),
                    Map.class
            ).getBody();

            Object signedUrl = response == null ? null :
                    response.getOrDefault("signedUrl", response.get("signedURL"));
            if (!(signedUrl instanceof String signedPath) || signedPath.isBlank()) {
                throw new ValidationException("Could not create receipt access link.");
            }
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
                return signedPath;
            }
            return normalizedStorageUrl() + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Fuel receipt file was not found.");
            }
            throw new ValidationException("Could not create receipt access link. Please try again.", e);
        } catch (ValidationException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Fuel receipt signed URL failed: path={}, error={}", objectPath, e.getMessage());
            throw new ValidationException("Could not create receipt access link. Please try again.", e);
        }
    }

    void validateReceipt(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("Receipt file is required.");
        }
        if (file.getSize() > MAX_RECEIPT_BYTES) {
            throw new ValidationException(
                    "Receipt file is too large.",
                    Map.of("receipt", "Receipt must be 5 MB or smaller.")
            );
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ValidationException(
                    "Invalid receipt file type.",
                    Map.of("receipt", "Receipt must be a JPEG, PNG, WebP image, or PDF.")
            );
        }

        String originalFilename = file.getOriginalFilename();
        String lowerFilename = originalFilename == null
                ? ""
                : originalFilename.toLowerCase(Locale.ROOT);
        boolean allowedExtension = ALLOWED_EXTENSIONS.stream().anyMatch(lowerFilename::endsWith);
        if (!allowedExtension) {
            throw new ValidationException(
                    "Invalid receipt file type.",
                    Map.of("receipt", "Receipt filename must end with .jpg, .jpeg, .png, .webp, or .pdf.")
            );
        }

        if (!hasExpectedFileSignature(file, contentType.toLowerCase(Locale.ROOT))) {
            throw new ValidationException(
                    "Invalid receipt file type.",
                    Map.of("receipt", "Receipt content does not match the selected file type.")
            );
        }
    }

    private boolean hasExpectedFileSignature(MultipartFile file, String contentType) {
        byte[] header = new byte[12];
        int read;
        try (InputStream inputStream = file.getInputStream()) {
            read = inputStream.read(header);
        } catch (IOException ex) {
            throw new ValidationException("Could not read receipt file.", ex);
        }

        if (read < 4) {
            return false;
        }

        return switch (contentType) {
            case "application/pdf" -> header[0] == '%'
                    && header[1] == 'P'
                    && header[2] == 'D'
                    && header[3] == 'F';
            case "image/jpeg" -> (header[0] & 0xFF) == 0xFF
                    && (header[1] & 0xFF) == 0xD8
                    && (header[2] & 0xFF) == 0xFF;
            case "image/png" -> read >= 8
                    && (header[0] & 0xFF) == 0x89
                    && header[1] == 'P'
                    && header[2] == 'N'
                    && header[3] == 'G'
                    && header[4] == 0x0D
                    && header[5] == 0x0A
                    && header[6] == 0x1A
                    && header[7] == 0x0A;
            case "image/webp" -> read >= 12
                    && header[0] == 'R'
                    && header[1] == 'I'
                    && header[2] == 'F'
                    && header[3] == 'F'
                    && header[8] == 'W'
                    && header[9] == 'E'
                    && header[10] == 'B'
                    && header[11] == 'P';
            default -> false;
        };
    }

    String sanitizeFilename(String original) {
        if (original == null || original.isBlank()) {
            return "receipt";
        }

        String base = original;
        int slash = Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\'));
        if (slash >= 0) {
            base = base.substring(slash + 1);
        }

        String sanitized = base.replaceAll("[^a-zA-Z0-9._-]", "_");
        if (sanitized.isBlank() || ".".equals(sanitized) || "..".equals(sanitized)) {
            return "receipt";
        }
        return sanitized;
    }

    private void requireConfigured() {
        if (config.getStorageUrl() == null || config.getStorageUrl().isBlank()
                || config.getBucket() == null || config.getBucket().isBlank()
                || config.getServiceKey() == null || config.getServiceKey().isBlank()) {
            throw new ValidationException("Supabase storage is not configured.");
        }
    }

    private String normalizedStorageUrl() {
        return config.getStorageUrl().replaceAll("/+$", "");
    }

    private String resolveReceiptObjectPath(String storedReference) {
        if (storedReference == null || storedReference.isBlank()) {
            return null;
        }

        String value = storedReference.trim();
        if (value.startsWith(RECEIPT_PREFIX)) {
            return value;
        }

        String publicPrefix = normalizedStorageUrl()
                + "/object/public/"
                + config.getBucket()
                + "/";
        if (value.startsWith(publicPrefix)) {
            return value.substring(publicPrefix.length());
        }

        String objectPrefix = normalizedStorageUrl()
                + "/object/"
                + config.getBucket()
                + "/";
        if (value.startsWith(objectPrefix)) {
            return value.substring(objectPrefix.length());
        }

        return null;
    }
}
