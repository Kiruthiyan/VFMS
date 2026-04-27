package com.vfms.fuel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateFuelRecordRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    private UUID driverId;

    @NotNull(message = "Fuel date is required")
    private LocalDate fuelDate;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Quantity must have up to 6 digits and 2 decimals")
    private BigDecimal quantity;

    @NotNull(message = "Cost per litre is required")
    @DecimalMin(value = "0.01", message = "Cost per litre must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Cost per litre must have up to 6 digits and 2 decimals")
    private BigDecimal costPerLitre;

    @NotNull(message = "Odometer reading is required")
    @DecimalMin(value = "0.0", message = "Odometer cannot be negative")
    private Double odometerReading;

    @Size(max = 120, message = "Fuel station must not exceed 120 characters")
    private String fuelStation;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;
}
