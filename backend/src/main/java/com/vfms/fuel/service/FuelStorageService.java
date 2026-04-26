package com.vfms.fuel.service;

import com.vfms.fuel.config.SupabaseStorageConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
<<<<<<< HEAD
import com.vfms.common.exception.ValidationException;
=======
>>>>>>> origin/feature/user-management
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuelStorageService {

    private final SupabaseStorageConfig config;
    private final RestTemplate restTemplate;

    /**
     * Upload receipt to Supabase Storage.
     * Returns the public URL of the uploaded file.
     */
    public String uploadReceipt(MultipartFile file) {
        try {
<<<<<<< HEAD
            if (config.getStorageUrl() == null || config.getStorageUrl().isBlank()
                    || config.getBucket() == null || config.getBucket().isBlank()
                    || config.getServiceKey() == null || config.getServiceKey().isBlank()) {
                throw new ValidationException("Supabase storage is not configured.");
            }

=======
>>>>>>> origin/feature/user-management
            String fileName = "receipts/"
                    + UUID.randomUUID()
                    + "_"
                    + file.getOriginalFilename();

            String uploadUrl = config.getStorageUrl()
                    + "/object/"
                    + config.getBucket()
                    + "/"
                    + fileName;

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + config.getServiceKey());
            headers.setContentType(
                    MediaType.parseMediaType(
                            file.getContentType() != null
                                    ? file.getContentType()
                                    : "application/octet-stream"));

            HttpEntity<byte[]> entity =
                    new HttpEntity<>(file.getBytes(), headers);

            restTemplate.exchange(uploadUrl, HttpMethod.POST,
                    entity, String.class);

            // Return public URL
            return config.getStorageUrl()
                    + "/object/public/"
                    + config.getBucket()
                    + "/"
                    + fileName;

        } catch (Exception e) {
            log.error("Failed to upload receipt: {}", e.getMessage());
<<<<<<< HEAD
            throw new ValidationException("Failed to upload receipt. Please try again.");
=======
            throw new RuntimeException(
                    "Failed to upload receipt. Please try again.");
>>>>>>> origin/feature/user-management
        }
    }
}
