package com.vfms.fuel.controller;

import com.vfms.auth.model.User;
import com.vfms.file.service.FileService;
import com.vfms.fuel.model.FuelRecord;
import com.vfms.fuel.service.FuelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
<<<<<<< HEAD
=======
import org.springframework.security.core.annotation.AuthenticationPrincipal;
>>>>>>> 0c49f51 (fixed user verification)
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fuel")
@RequiredArgsConstructor
@Slf4j
public class FuelController {
    private final FuelService service;
    private final FileService fileService;

    /**
     * Get all fuel records with pagination
     * Query params: page=0&size=20&sort=date,desc
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping
<<<<<<< HEAD
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
=======
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Page<FuelRecord>> getAllFuelRecords(Pageable pageable) {
        log.info("Fetching all fuel records with pagination");
        return ResponseEntity.ok(service.getAllFuelRecordsWithPagination(pageable));
    }

    /**
     * Get a specific fuel record by ID
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> getFuelRecordById(@PathVariable Integer id) {
        log.info("Fetching fuel record with ID: {}", id);
        try {
            return service.getFuelRecordById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
>>>>>>> 0c49f51 (fixed user verification)
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Add new fuel record
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> addFuelRecord(@RequestBody FuelRecord record,
                                           @AuthenticationPrincipal User currentUser) {
        try {
            // Always use the authenticated user's ID — never trust client-supplied driverId
            record.setDriverId(currentUser.getId());
            log.info("Adding fuel record - Vehicle Plate: {}, Driver ID: {}, Quantity: {}, Cost: {}",
                    record.getVehiclePlate(), record.getDriverId(), record.getQuantity(), record.getCost());

            FuelRecord saved = service.addFuelRecord(record);
            log.info("Fuel record saved successfully with ID: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("ERROR saving fuel record: ", e);
            return ResponseEntity.status(500).body(Map.of("message", "Failed to save fuel record: " + e.getMessage()));
        }
    }

    /**
     * Get fuel records for a specific vehicle by plate number with pagination
     * Query params: page=0&size=20&sort=date,desc
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @GetMapping("/vehicle/{vehiclePlate}")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<?> getByVehicleWithPagination(@PathVariable String vehiclePlate, Pageable pageable) {
        log.info("Fetching fuel records for vehicle plate: {} with pagination", vehiclePlate);
        try {
            return ResponseEntity.ok(service.getFuelRecordsByVehicleWithPagination(vehiclePlate, pageable));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Upload fuel receipt/document
     * Protected endpoint - requires DRIVER or ADMIN role
     */
    @PostMapping("/upload-receipt")
    @PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
    public ResponseEntity<Map<String, String>> uploadReceipt(@RequestParam("file") MultipartFile file) throws IOException {
        log.info("Uploading fuel receipt file: {}", file.getOriginalFilename());
        
        String receiptPath = fileService.uploadReceipt(file);
        
        Map<String, String> response = new HashMap<>();
        response.put("receiptPath", receiptPath);
        response.put("message", "Receipt uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
}
