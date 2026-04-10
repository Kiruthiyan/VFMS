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

}
