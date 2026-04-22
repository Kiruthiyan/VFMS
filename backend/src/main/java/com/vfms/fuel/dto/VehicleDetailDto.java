package com.vfms.fuel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Lightweight DTO for vehicle details fetched in fuel module
 * Only contains essential fields needed for fuel management
 * Fetches real-time data from vehicle endpoint
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDetailDto {
    
    @JsonProperty("id")
    private UUID id;
    
    @JsonProperty("plate_number")
    private String plateNumber;
    
    @JsonProperty("make")
    private String make;
    
    @JsonProperty("model")
    private String model;
    
    @JsonProperty("year")
    private Integer year;
    
    @JsonProperty("vehicle_type")
    private String vehicleType;
    
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("fuel_level")
    private BigDecimal fuelLevel;
    
    @JsonProperty("odometer_reading")
    private Double odometerReading;
    
    @JsonProperty("last_service_date")
    private String lastServiceDate;
    
    // Computed fields
    public String getDisplayName() {
        return make + " " + model + " (" + year + ")";
    }
    
    public String getPlateAndName() {
        return plateNumber + " - " + getDisplayName();
    }
}
