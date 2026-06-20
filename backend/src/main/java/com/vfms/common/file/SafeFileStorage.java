package com.vfms.common.file;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.UUID;

public final class SafeFileStorage {

    private SafeFileStorage() {}

    public static String buildStoredFileName(String prefix, Long id, MultipartFile file) {
        String originalName = file.getOriginalFilename();
        String safeOriginalName = sanitizeOriginalFileName(originalName);
        return prefix + "_" + id + "_" + UUID.randomUUID() + "_" + safeOriginalName;
    }

    public static Path resolveDownloadPath(Path uploadDir, String fileName) {
        validateDownloadFileName(fileName);
        Path absoluteUploadDir = uploadDir.toAbsolutePath().normalize();
        Path resolvedPath = absoluteUploadDir.resolve(fileName).normalize();

        if (!resolvedPath.startsWith(absoluteUploadDir)) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        return resolvedPath;
    }

    public static Resource loadResource(Path filePath) throws MalformedURLException {
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IllegalArgumentException("File not found.");
        }
        return resource;
    }

    public static String contentTypeFor(String fileName) {
        return fileName.toLowerCase().endsWith(".pdf")
                ? "application/pdf"
                : "application/octet-stream";
    }

    private static void validateDownloadFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name is required.");
        }

        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new IllegalArgumentException("Invalid file name.");
        }
    }

    private static String sanitizeOriginalFileName(String originalName) {
        if (originalName == null || originalName.isBlank()) {
            return "document";
        }

        String fileNameOnly = originalName.replace("\\", "/");
        int slashIndex = fileNameOnly.lastIndexOf('/');
        if (slashIndex >= 0) {
            fileNameOnly = fileNameOnly.substring(slashIndex + 1);
        }

        String sanitized = fileNameOnly.replaceAll("[^A-Za-z0-9._-]", "_");
        sanitized = sanitized.replaceAll("^\\.+", "");

        return sanitized.isBlank() ? "document" : sanitized;
    }
}
