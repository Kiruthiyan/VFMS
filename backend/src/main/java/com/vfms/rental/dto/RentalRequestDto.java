package com.vfms.rental.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @DecimalMin(value = "0.01", message = "Cost per day must be greater than zero")
    private BigDecimal costPerDay;

    @Size(max = 500, message = "Purpose description is too long")
    private String purpose;
}
