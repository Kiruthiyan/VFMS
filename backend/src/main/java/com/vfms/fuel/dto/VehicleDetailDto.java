package com.vfms.fuel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * VehicleDetailDto - Real-Time Vehicle Data Transfer Object
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   Lightweight data object that represents vehicle information fetched from
 *   the vehicle endpoint. This DTO is specifically designed for the fuel module
 *   and only contains fields relevant to fuel management.
 * 
 * WHEN IT'S USED:
 *   - When FuelService calls VehicleApiClient to fetch vehicle data from Supabase
 *   - For real-time vehicle status checks (fuel level, odometer, status)
 *   - To enrich fuel records with current vehicle information
 * 
 * KEY DESIGN DECISIONS:
 *   1. Only includes essential fields (not all vehicle data)
 *   2. Uses @JsonProperty to map snake_case database columns to camelCase Java fields
 *   3. Includes helper methods (getDisplayName, getPlateAndName) for formatting
 * 
 * EXAMPLE USAGE:
 *   VehicleDetailDto vehicle = vehicleApiClient.getVehicleById(vehicleId);
 *   String displayName = vehicle.getDisplayName(); // "Toyota Camry (2023)"
 */
@Data                   // Generates getters, setters, equals, hashCode, toString
@Builder               // Enables builder pattern for easy object creation
@NoArgsConstructor     // Creates empty constructor (required by Jackson for deserialization)
@AllArgsConstructor    // Creates constructor with all fields
public class VehicleDetailDto {
    
    // ── CORE IDENTIFICATION FIELDS ────────────────────────────────────────
    
    /** Unique vehicle identifier from the vehicles table */
    @JsonProperty("id")
    private Long id;
    
    /** Vehicle license plate number (e.g., "ABC-1234") - maps to plate_number column */
    @JsonProperty("plate_number")
    private String plateNumber;
    
    // ── VEHICLE CHARACTERISTICS ──────────────────────────────────────────
    
    /** Vehicle manufacturer (e.g., "Toyota", "Honda") - maps to brand/make column */
    @JsonProperty("make")
    @JsonAlias("brand")
    private String make;
    
    /** Vehicle model (e.g., "Camry", "Accord") - maps to model column */
    @JsonProperty("model")
    private String model;
    
    /** Year of manufacture (e.g., 2023) - maps to year column */
    @JsonProperty("year")
    private Integer year;
    
    /** Type of vehicle (e.g., "SEDAN", "SUV", "TRUCK") - maps to vehicle_type column */
    @JsonProperty("vehicle_type")
    private String vehicleType;
    
    // ── OPERATIONAL STATUS ────────────────────────────────────────────────
    
    /** Current vehicle status (e.g., "AVAILABLE", "IN_USE", "MAINTENANCE") - maps to status column */
    @JsonProperty("status")
    private String status;
    
    // ── FUEL AND ODOMETER INFORMATION ────────────────────────────────────
    
    /** Current fuel level in liters/tank percentage - maps to fuel_level column */
    @JsonProperty("fuel_level")
    private BigDecimal fuelLevel;
    
    /** Current odometer reading in kilometers - maps to odometer_reading column */
    @JsonProperty("odometer_reading")
    private Double odometerReading;
    
    // ── MAINTENANCE TRACKING ────────────────────────────────────────────
    
    /** Date of last service/maintenance - maps to last_service_date column */
    @JsonProperty("last_service_date")
    private String lastServiceDate;
    
    // ═══════════════════════════════════════════════════════════════════════
    // COMPUTED/HELPER METHODS - For convenient data formatting
    // ═══════════════════════════════════════════════════════════════════════
    
    /**
     * Generate a human-readable vehicle name combining make, model, and year.
     * 
     * EXAMPLE OUTPUT:
     *   "Toyota Camry (2023)"
     *   "Honda Accord (2022)"
     * 
     * USED IN:
     *   - UI displays for vehicle information
     *   - Log messages for clarity
     *   - Fuel record responses
     */
    public String getDisplayName() {
        return make + " " + model + " (" + year + ")";
    }
    
    /**
     * Generate a complete vehicle identifier combining plate and display name.
     * 
     * EXAMPLE OUTPUT:
     *   "ABC-1234 - Toyota Camry (2023)"
     *   "XYZ-9876 - Honda Accord (2022)"
     * 
     * USED IN:
     *   - Detailed vehicle selection screens
     *   - Log messages for easy identification
     *   - Reports and records
     */
    public String getPlateAndName() {
        return plateNumber + " - " + getDisplayName();
    }
}
