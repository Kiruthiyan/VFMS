package com.vfms.fuel.dto;

import jakarta.validation.constraints.DecimalMin;
<<<<<<< HEAD
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
=======
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
>>>>>>> origin/feature/user-management
import java.util.UUID;

@Data
public class CreateFuelRecordRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    private UUID driverId;          // optional

<<<<<<< HEAD
    @NotNull(message = "Fuel date is required")
    private LocalDate fuelDate;        // YYYY-MM-DD

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Quantity must have up to 6 digits and 2 decimals")
=======
    @NotBlank(message = "Fuel date is required")
    private String fuelDate;        // YYYY-MM-DD

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
>>>>>>> origin/feature/user-management
    private BigDecimal quantity;    // litres

    @NotNull(message = "Cost per litre is required")
    @DecimalMin(value = "0.01", message = "Cost per litre must be greater than 0")
<<<<<<< HEAD
    @Digits(integer = 6, fraction = 2, message = "Cost per litre must have up to 6 digits and 2 decimals")
=======
>>>>>>> origin/feature/user-management
    private BigDecimal costPerLitre;

    @NotNull(message = "Odometer reading is required")
    @DecimalMin(value = "0.0", message = "Odometer cannot be negative")
    private Double odometerReading;

<<<<<<< HEAD
    @Size(max = 120, message = "Fuel station must not exceed 120 characters")
    private String fuelStation;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
=======
    private String fuelStation;
>>>>>>> origin/feature/user-management
    private String notes;
}
