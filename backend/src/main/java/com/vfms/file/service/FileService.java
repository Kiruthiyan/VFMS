package com.vfms.file.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Service for handling file operations (uploads, deletions, etc.)
 * Centralizes file handling logic away from controllers.
 */
@Service
@Slf4j
public class FileService {

    private static final String UPLOAD_BASE_DIR = "uploads";
    private static final int MAX_FILE_SIZE_MB = 5;
    private static final String[] ALLOWED_MIME_TYPES = {
            "image/jpeg",
            "image/png",
            "application/pdf"
    };

    /**
     * Upload a receipt file (for fuel records)
     * 
     * @param file the file to upload
     * @return the relative file path where the file was saved
     * @throws IllegalArgumentException if file validation fails
     * @throws IOException if file save operation fails
     */
    public String uploadReceipt(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);

        // Create uploads/receipts directory
        String uploadDir = UPLOAD_BASE_DIR + "/receipts";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
            log.debug("Created receipts upload directory");
        }

        // Generate unique filename
        String filename = generateUniqueFilename(file.getOriginalFilename());

        // Save file
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        String relativePath = uploadDir + "/" + filename;
        log.info("Receipt uploaded successfully: {}", relativePath);
        return relativePath;
    }

    /**
     * Delete a file by its relative path
     * 
     * @param filePath the relative path of the file to delete
     * @return true if deletion successful, false if file not found
     * @throws IOException if deletion fails
     */
    public boolean deleteFile(String filePath) throws IOException {
        if (filePath == null || filePath.isBlank()) {
            log.warn("Attempted to delete file with null or empty path");
            return false;
        }

        Path path = Paths.get(filePath);
        if (!Files.exists(path)) {
            log.warn("File not found for deletion: {}", filePath);
            return false;
        }

        Files.delete(path);
        log.info("File deleted successfully: {}", filePath);
        return true;
    }

    /**
     * Get the full absolute path for a relative file path
     * 
     * @param relativePath the relative path
     * @return the absolute Path object
     */
    public Path getAbsolutePath(String relativePath) {
        return Paths.get(relativePath).toAbsolutePath();
    }

    /**
     * Check if a file exists
     * 
     * @param filePath the relative path to check
     * @return true if file exists, false otherwise
     */
    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    /**
     * Validate uploaded file
     * Checks: not empty, within size limit, correct MIME type
     * 
     * @param file the file to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        long maxSizeBytes = (long) MAX_FILE_SIZE_MB * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new IllegalArgumentException(
                    String.format("File size exceeds %dMB limit", MAX_FILE_SIZE_MB)
            );
        }

        // Check MIME type
        String contentType = file.getContentType();
        if (contentType == null || !isAllowedMimeType(contentType)) {
            throw new IllegalArgumentException(
                    "Only JPG, PNG, and PDF files are allowed"
            );
        }

        log.debug("File validation passed: {}", file.getOriginalFilename());
    }

    /**
     * Check if MIME type is allowed
     */
    private boolean isAllowedMimeType(String mimeType) {
        for (String allowedType : ALLOWED_MIME_TYPES) {
            if (allowedType.equalsIgnoreCase(mimeType)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate unique filename from original filename
     */
    private String generateUniqueFilename(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }
}
