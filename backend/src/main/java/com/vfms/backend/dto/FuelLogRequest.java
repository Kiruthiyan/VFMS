package com.vfms.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FuelLogRequest {
    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Fuel quantity is required")
    @Positive(message = "Fuel quantity must be positive")
    private Double fuelQuantity;

    @NotNull(message = "Cost is required")
    @Positive(message = "Cost must be greater than zero")
    private Double cost;

    @NotNull(message = "Date is required")
    private LocalDate date;
}

