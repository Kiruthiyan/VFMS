package com.vfms.fuel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class CreateFuelRecordRequest {

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    private UUID driverId;          // optional

    @NotBlank(message = "Fuel date is required")
    private String fuelDate;        // YYYY-MM-DD

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    private BigDecimal quantity;    // litres

    @NotNull(message = "Cost per litre is required")
    @DecimalMin(value = "0.01", message = "Cost per litre must be greater than 0")
    private BigDecimal costPerLitre;

    @NotNull(message = "Odometer reading is required")
    @DecimalMin(value = "0.0", message = "Odometer cannot be negative")
    private Double odometerReading;

    private String fuelStation;
    private String notes;
}
