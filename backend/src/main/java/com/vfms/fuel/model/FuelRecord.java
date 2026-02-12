package com.vfms.fuel.model;

import jakarta.persistence.*;
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
@Table(name = "fuel_logs") // Updated table name per requirements
public class FuelRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "vehicle_id", nullable = false)
    private Integer vehicleId;

    @Column(name = "driver_id")
    private Integer driverId;

    @Column(name = "fuel_amount")
    private Double quantity; // liters

    @Column(name = "total_cost")
    private Double cost;

    @Column(name = "price_per_liter")
    private Double pricePerLiter;

    private Double mileage; // current odometer

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "receipt_path")
    private String receiptPath;

    @Column(name = "purchase_date")
    private LocalDate date;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }
}
