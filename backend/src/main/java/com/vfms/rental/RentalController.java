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



}
