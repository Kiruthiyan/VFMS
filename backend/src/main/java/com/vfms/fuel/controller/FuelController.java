package com.vfms.fuel.controller;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.service.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
public class FuelController {
    private final FuelService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'APPROVER')")
    public ResponseEntity<List<FuelRecord>> getAllFuelRecords() {
        return ResponseEntity.ok(service.getAllFuelRecords());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<?> addFuelRecord(@RequestBody FuelRecord record) {
        try {
            if (record.getVehicleId() == null || record.getQuantity() == null || record.getCost() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Vehicle ID, quantity, and cost are required"));
            }
            if (record.getQuantity() <= 0 || record.getCost() <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity and cost must be positive values"));
            }
            FuelRecord saved = service.addFuelRecord(record);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to save fuel record"));
        }
    }

    @GetMapping("/vehicle/{vehicleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM_USER', 'APPROVER')")
    public ResponseEntity<List<FuelRecord>> getByVehicle(@PathVariable Integer vehicleId) {
        return ResponseEntity.ok(service.getFuelRecordsByVehicle(vehicleId));
    }

    @PostMapping("/upload-receipt")
    @PreAuthorize("hasAnyRole('ADMIN', 'DRIVER')")
    public ResponseEntity<Map<String, String>> uploadReceipt(@RequestParam("file") MultipartFile file) {
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Validate file size (5MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new IllegalArgumentException("File size exceeds 5MB limit");
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !(contentType.equals("image/jpeg") ||
                    contentType.equals("image/png") || contentType.equals("application/pdf"))) {
                throw new IllegalArgumentException("Only JPG, PNG, and PDF files are allowed");
            }

            // Create uploads directory if it doesn't exist
            String uploadDir = "uploads/receipts";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename (sanitized)
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                throw new IllegalArgumentException("Invalid file name");
            }
            
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                    : "";
            
            if (!extension.matches("\\.(jpg|jpeg|png|pdf)$")) {
                throw new IllegalArgumentException("Invalid file extension");
            }
            
            String filename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return file path
            Map<String, String> response = new HashMap<>();
            response.put("receiptPath", uploadDir + "/" + filename);
            response.put("message", "Receipt uploaded successfully");

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file");
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
