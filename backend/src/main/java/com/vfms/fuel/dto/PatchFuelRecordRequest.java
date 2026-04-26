package com.vfms.fuel.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Partial update DTO for fuel records.
 * All fields are optional; validation applies only when a field is provided.
 */
@Data
public class PatchFuelRecordRequest {

    private UUID vehicleId;

    private UUID driverId;

    private LocalDate fuelDate;

    @DecimalMin(value = "0.01", message = "Quantity must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Quantity must have up to 6 digits and 2 decimals")
    private BigDecimal quantity;

    @DecimalMin(value = "0.01", message = "Cost per litre must be greater than 0")
    @Digits(integer = 6, fraction = 2, message = "Cost per litre must have up to 6 digits and 2 decimals")
    private BigDecimal costPerLitre;

    @DecimalMin(value = "0.0", message = "Odometer cannot be negative")
    private Double odometerReading;

    @Size(max = 120, message = "Fuel station must not exceed 120 characters")
    private String fuelStation;

    @Size(max = 1000, message = "Notes must not exceed 1000 characters")
    private String notes;

    // Explicit accessors (keeps builds resilient even if Lombok processing is misconfigured)
    public UUID getVehicleId() { return vehicleId; }
    public void setVehicleId(UUID vehicleId) { this.vehicleId = vehicleId; }
    public UUID getDriverId() { return driverId; }
    public void setDriverId(UUID driverId) { this.driverId = driverId; }
    public LocalDate getFuelDate() { return fuelDate; }
    public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getCostPerLitre() { return costPerLitre; }
    public void setCostPerLitre(BigDecimal costPerLitre) { this.costPerLitre = costPerLitre; }
    public Double getOdometerReading() { return odometerReading; }
    public void setOdometerReading(Double odometerReading) { this.odometerReading = odometerReading; }
    public String getFuelStation() { return fuelStation; }
    public void setFuelStation(String fuelStation) { this.fuelStation = fuelStation; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}

