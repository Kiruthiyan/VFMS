package com.vfms.fuel.controller;

import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.service.FuelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<FuelRecord>> getAllFuelRecords() {
        return ResponseEntity.ok(service.getAllFuelRecords());
    }

    @PostMapping
    public ResponseEntity<?> addFuelRecord(@RequestBody FuelRecord record) {
        try {
            System.out.println("=== FUEL RECORD RECEIVED ===");
            System.out.println("Vehicle ID: " + record.getVehicleId());
            System.out.println("Driver ID: " + record.getDriverId());
            System.out.println("Quantity: " + record.getQuantity());
            System.out.println("Cost: " + record.getCost());
            System.out.println("Mileage: " + record.getMileage());
            System.out.println("Station: " + record.getStationName());
            System.out.println("Date: " + record.getDate());
            System.out.println("===========================");

            FuelRecord saved = service.addFuelRecord(record);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("ERROR saving fuel record: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<FuelRecord>> getByVehicle(@PathVariable Integer vehicleId) {
        return ResponseEntity.ok(service.getFuelRecordsByVehicle(vehicleId));
    }

    @PostMapping("/upload-receipt")
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

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
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
