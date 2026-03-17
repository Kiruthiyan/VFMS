package com.vfms.fuel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "fuel_logs", indexes = {
        @Index(name = "idx_vehicle_plate", columnList = "vehicle_plate"),
        @Index(name = "idx_driver_id", columnList = "driver_id"),
        @Index(name = "idx_purchase_date", columnList = "purchase_date"),
        @Index(name = "idx_vehicle_date", columnList = "vehicle_plate,purchase_date")
})
public class FuelRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "vehicle_plate", nullable = false, length = 20)
    @NotNull(message = "Vehicle plate is required")
    private String vehiclePlate;

    @Column(name = "driver_id")
    private Integer driverId; // Set server-side from JWT

    @Column(name = "fuel_amount")
    @NotNull(message = "Fuel quantity is required")
    @DecimalMin(value = "0.1", message = "Fuel quantity must be greater than 0")
    private Double quantity; // liters

    @Column(name = "total_cost")
    @NotNull(message = "Total cost is required")
    @DecimalMin(value = "0.01", message = "Cost must be greater than 0")
    private Double cost;

    @Column(name = "price_per_liter")
    @DecimalMin(value = "0.01", message = "Price per liter must be greater than 0")
    private Double pricePerLiter;

    @NotNull(message = "Mileage is required")
    @DecimalMin(value = "0", message = "Mileage cannot be negative")
    private Double mileage; // current odometer

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "receipt_path")
    private String receiptPath;

    @Column(name = "purchase_date")
    @NotNull(message = "Purchase date is required")
    private LocalDate date;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }
}
