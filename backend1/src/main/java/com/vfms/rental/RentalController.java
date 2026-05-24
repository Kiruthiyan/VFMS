package com.vfms.rental;

import com.vfms.common.dto.ApiResponse;
import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponseDto>> updateRental(
            @PathVariable Long id, @Valid @RequestBody RentalRequestDto request) {
        RentalResponseDto response = rentalService.updateRental(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rental updated", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RentalResponseDto>>> getAllRentals(
            @RequestParam(required = false) RentalStatus status,
            @RequestParam(required = false) Long vendorId) {
        List<RentalResponseDto> response;

        // Filtering is done here rather than in the service to keep the service methods focused on single responsibilities
        if (status != null) {
            response = rentalService.getRentalsByStatus(status);
        } else if (vendorId != null) {
            response = rentalService.getRentalsByVendor(vendorId);
        } else {
            response = rentalService.getAllRentals();
        }

        return ResponseEntity.ok(ApiResponse.success("Rentals fetched", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RentalResponseDto>> getRentalById(@PathVariable Long id) {
        RentalResponseDto response = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.success("Rental fetched", response));
    }

    @PostMapping("/{id}/agreement")
    public ResponseEntity<ApiResponse<RentalResponseDto>> uploadAgreement(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Prefixing with rental ID ensures filenames stay unique across rentals and makes it easy to trace back which rental a file belongs to
            String fileName = "agreement_" + id + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/rental");

            // Directory is created lazily so the app doesn't require manual setup on new environments or after a clean deployment
            Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(fileName).toFile());

            String fileUrl = "/api/rentals/files/" + fileName;
            RentalResponseDto response = rentalService.uploadAgreement(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Agreement uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload agreement: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/invoice")
    public ResponseEntity<ApiResponse<RentalResponseDto>> uploadInvoice(
            @PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            // Same naming convention as agreements so file management stays consistent
            String fileName = "invoice_" + id + "_" + file.getOriginalFilename();
            Path uploadDir = Paths.get("uploads/rental");
            Files.createDirectories(uploadDir);
            file.transferTo(uploadDir.resolve(fileName).toFile());

            String fileUrl = "/api/rentals/files/" + fileName;
            RentalResponseDto response = rentalService.uploadInvoice(id, fileUrl);
            return ResponseEntity.ok(ApiResponse.success("Invoice uploaded", response));
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload invoice: " + e.getMessage());
        }
    }

    @GetMapping("/files/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get("uploads/rental").resolve(fileName);
            Resource resource = new UrlResource(filePath.toUri());

            // PDF files are served inline so clients can preview them in the browser without forcing a download, improving the user experience for document review
            String contentType = fileName.endsWith(".pdf")
                    ? "application/pdf"
                    : "application/octet-stream";

            return ResponseEntity.ok()
                    .header("Content-Disposition", "inline; filename=\"" + fileName + "\"")
                    .header("Content-Type", contentType)
                    .body(resource);
        } catch (Exception e) {
            throw new RuntimeException("File not found: " + e.getMessage());
        }
    }

    @PatchMapping("/{id}/return")
    public ResponseEntity<ApiResponse<RentalResponseDto>> confirmReturn(
            @PathVariable Long id, @RequestParam LocalDate returnDate) {
        // Return date is accepted as a parameter rather than derived from the current date to support backdated returns when logistics delays occur
        RentalResponseDto response = rentalService.confirmReturn(id, returnDate);
        return ResponseEntity.ok(ApiResponse.success("Vehicle return confirmed", response));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<RentalResponseDto>> closeRental(@PathVariable Long id) {
        // Closing is a separate step from returning so finance can reconcile costs and verify invoices before marking a rental as fully settled
        RentalResponseDto response = rentalService.closeRental(id);
        return ResponseEntity.ok(ApiResponse.success("Rental closed", response));
    }

    @GetMapping("/reports/cost-summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRentalCostSummary() {
        return ResponseEntity.ok(
                ApiResponse.success("Rental cost summary fetched", rentalService.getRentalCostSummary()));
    }

    @GetMapping("/reports/active")
    public ResponseEntity<ApiResponse<List<RentalResponseDto>>> getActiveRentals() {
        // Delegates to the existing status filter rather than adding a redundant service method, keeping the service layer lean
        return ResponseEntity.ok(
                ApiResponse.success("Active rentals fetched",
                        rentalService.getRentalsByStatus(RentalStatus.ACTIVE)));
    }

    @GetMapping("/reports/cost-per-vendor")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getCostPerVendor() {
        return ResponseEntity.ok(
                ApiResponse.success("Cost per vendor fetched", rentalService.getCostPerVendor()));
    }
}