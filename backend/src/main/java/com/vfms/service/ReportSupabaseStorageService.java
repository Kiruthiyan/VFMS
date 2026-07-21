package com.vfms.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.config.ReportSupabaseStorageProperties;
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
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportSupabaseStorageService {

    private final ReportSupabaseStorageProperties properties;
    private final RestTemplate restTemplate;

    public String uploadReportFile(String reportType, String format, MultipartFile file) {
        requireConfigured();

        // Separate reports clearly by directory prefix in the bucket: reports/{type}/{uuid}.{format}
        String originalName = file.getOriginalFilename() == null ? "report" : file.getOriginalFilename();
        String extension = originalName.contains(".") ? originalName.substring(originalName.lastIndexOf('.') + 1) : format;
        String objectPath = "reports/" + reportType.toLowerCase() + "/" + UUID.randomUUID() + "." + extension;
        String uploadUrl = storageUrl() + "/object/" + properties.getBucket() + "/" + objectPath;

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            log.error("Report upload failed - could not read file bytes: type={}, format={}, error={}",
                    reportType, format, e.getMessage(), e);
            throw new ValidationException("Could not read report file bytes.", e);
        }

        try {
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));
            restTemplate.exchange(uploadUrl, HttpMethod.POST, new HttpEntity<>(fileBytes, headers), String.class);
            log.info("Report storage upload succeeded: bucket={}, path={}", properties.getBucket(), objectPath);
            return objectPath;
        } catch (Exception e) {
            log.error("Report storage upload failed: bucket={}, path={}, error={}",
                    properties.getBucket(), objectPath, e.getMessage(), e);
            throw new ValidationException("Failed to upload report file to Supabase. Please try again.", e);
        }
    }

    public void deleteObjectQuietly(String bucketName, String storagePath) {
        try {
            if (bucketName == null || bucketName.isBlank() || storagePath == null || storagePath.isBlank()) return;
            String deleteUrl = storageUrl() + "/object/" + bucketName;
            HttpHeaders headers = authHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, List<String>> body = Map.of("prefixes", List.of(storagePath));
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, new HttpEntity<>(body, headers), String.class);
            log.info("Report storage delete succeeded: bucket={}, path={}", bucketName, storagePath);
        } catch (Exception e) {
            log.warn("Report storage delete failed: bucket={}, path={}, error={}", bucketName, storagePath, e.getMessage());
        }
    }

    public String createSignedUrl(String bucketName, String storagePath) {
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
                throw new ValidationException("Could not create signed access URL.");
            }
            if (signedPath.startsWith("http://") || signedPath.startsWith("https://")) {
                return signedPath;
            }
            return storageUrl() + (signedPath.startsWith("/") ? signedPath : "/" + signedPath);
        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("Report file not found in storage.");
            }
            throw new ValidationException("Could not create document access link.", e);
        } catch (Exception e) {
            throw new ValidationException("Could not create document access link.", e);
        }
    }

    public String getBucketName() {
        return properties.getBucket();
    }

    private void requireConfigured() {
        if (properties.getStorageUrl() == null || properties.getStorageUrl().isBlank()
                || properties.getBucket() == null || properties.getBucket().isBlank()
                || properties.getServiceKey() == null || properties.getServiceKey().isBlank()) {
            throw new ValidationException("Report Supabase storage is not configured.");
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
}
