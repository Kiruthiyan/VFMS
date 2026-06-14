package com.vfms.fuel.service;

import com.vfms.common.exception.ValidationException;
import com.vfms.fuel.config.SupabaseStorageConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuelStorageService {

    private static final long MAX_RECEIPT_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf"
    );

    private final SupabaseStorageConfig config;
    private final RestTemplate restTemplate;

    public String uploadReceipt(MultipartFile file) {
        validateReceipt(file);

        try {
            if (config.getStorageUrl() == null || config.getStorageUrl().isBlank()
                    || config.getBucket() == null || config.getBucket().isBlank()
                    || config.getServiceKey() == null || config.getServiceKey().isBlank()) {
                throw new ValidationException("Supabase storage is not configured.");
            }

            String safeName = sanitizeFilename(file.getOriginalFilename());
            String fileName = "receipts/" + UUID.randomUUID() + "_" + safeName;
            String uploadUrl = config.getStorageUrl()
                    + "/object/"
                    + config.getBucket()
                    + "/"
                    + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getServiceKey());
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));

            HttpEntity<byte[]> entity = new HttpEntity<>(file.getBytes(), headers);
            restTemplate.exchange(uploadUrl, HttpMethod.POST, entity, String.class);

            return config.getStorageUrl()
                    + "/object/public/"
                    + config.getBucket()
                    + "/"
                    + fileName;
        } catch (ValidationException ex) {
            throw ex;
        } catch (Exception e) {
            log.error("Failed to upload receipt: {}", e.getMessage(), e);
            throw new ValidationException("Failed to upload receipt. Please try again.", e);
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
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new ValidationException(
                    "Invalid receipt file type.",
                    Map.of("receipt", "Receipt must be a JPEG, PNG, WebP image, or PDF.")
            );
        }
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
}
