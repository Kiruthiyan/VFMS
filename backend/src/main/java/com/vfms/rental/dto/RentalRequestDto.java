package com.vfms.rental.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RentalRequestDto {
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    @NotBlank(message = "Vehicle type is required")
    private String vehicleType;

    @NotBlank(message = "Plate number is required")
    private String plateNumber;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Cost per day is required")
    private BigDecimal costPerDay;

    private String purpose;
}

