package com.vfms.rental;

import com.vfms.common.dto.ApiResponse;
import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    public ResponseEntity<ApiResponse<RentalResponseDto>> createRental(
            @Valid @RequestBody RentalRequestDto request) {
        RentalResponseDto response = rentalService.createRental(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Rental record created", response));
    }

        // PUT /api/rentals/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponseDto>> updateRental(
            @PathVariable Long id, @Valid @RequestBody RentalRequestDto request) {
        RentalResponseDto response = rentalService.updateRental(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rental updated", response));
    }
        // GET /api/rentals
    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<RentalResponseDto>>> getAllRentals(
            @RequestParam(required = false) RentalStatus status,
            @RequestParam(required = false) Long vendorId) {
        java.util.List<RentalResponseDto> response;
        if (status != null) {
            response = rentalService.getRentalsByStatus(status);
        } else if (vendorId != null) {
            response = rentalService.getRentalsByVendor(vendorId);
        } else {
            response = rentalService.getAllRentals();
        }
        return ResponseEntity.ok(ApiResponse.success("Rentals fetched", response));
    }
        // GET /api/rentals/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponseDto>> getRentalById(@PathVariable Long id) {
        RentalResponseDto response = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.success("Rental fetched", response));
    }
        // POST /api/rentals/{id}/agreement (file upload)
    @PostMapping("/{id}/agreement")
    public ResponseEntity<ApiResponse<RentalResponseDto>> uploadAgreement(
            @PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileName = "agreement_" + id + "_" + file.getOriginalFilename();
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads/rental");
            java.nio.file.Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(fileName).toFile());
            String fileUrl = "/api/rentals/files/" + fileName;
            RentalResponseDto response = rentalService.uploadAgreement(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Agreement uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload agreement: " + e.getMessage());
        }
    }

    // POST /api/rentals/{id}/invoice (file upload)
    @PostMapping("/{id}/invoice")
    public ResponseEntity<ApiResponse<RentalResponseDto>> uploadInvoice(
            @PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            String fileName = "invoice_" + id + "_" + file.getOriginalFilename();
            java.nio.file.Path uploadDir = java.nio.file.Paths.get("uploads/rental");
            java.nio.file.Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(fileName).toFile());
            String fileUrl = "/api/rentals/files/" + fileName;
            RentalResponseDto response = rentalService.uploadInvoice(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Invoice uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload invoice: " + e.getMessage());
        }
    }

    // GET /api/rentals/files/{fileName}
    @GetMapping("/files/{fileName}")
    public ResponseEntity<org.springframework.core.io.Resource> getFile(@PathVariable String fileName) {
        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/rental").resolve(fileName);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            String contentType = fileName.endsWith(".pdf") ? "application/pdf" : "application/octet-stream";
            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .header("Content-Type", contentType)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + e.getMessage());
        }
    }

        // PATCH /api/rentals/{id}/return?returnDate=2026-04-20
    @PatchMapping("/{id}/return")
    public ResponseEntity<ApiResponse<RentalResponseDto>> confirmReturn(
            @PathVariable Long id, @RequestParam java.time.LocalDate returnDate) {
        RentalResponseDto response = rentalService.confirmReturn(id, returnDate);
        return ResponseEntity.ok(ApiResponse.success("Vehicle return confirmed", response));
    }

        // PATCH /api/rentals/{id}/close
    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<RentalResponseDto>> closeRental(@PathVariable Long id) {
        RentalResponseDto response = rentalService.closeRental(id);
        return ResponseEntity.ok(ApiResponse.success("Rental closed", response));
    }

}
