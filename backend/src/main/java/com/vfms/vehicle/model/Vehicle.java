package com.vfms.vehicle.model;

import jakarta.persistence.*;
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
@Table(name = "_vehicle")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    @NotNull(message = "Make is required")
    private String make; // Brand: Tata, Mahindra, Ashok Leyland, etc.

    @Column(nullable = false, length = 50)
    @NotNull(message = "Model is required")
    private String model; // Model: Ace, Bolero, Dost, etc.

    @Column(name = "license_plate", nullable = false, length = 20, unique = true)
    @NotNull(message = "License plate is required")
    private String licensePlate; // Vehicle plate number: TN-01-AB-1234

    @Column(name = "manufacture_year", nullable = false)
    @NotNull(message = "Year is required")
    private Integer yearOfManufacture; // Manufacturing year

<<<<<<< HEAD
    @Column(name = "\"year\"")
    private Integer year;
=======
    @Column(length = 50)
    private String fuelType; // PETROL, DIESEL, CNG, ELECTRIC, HYBRID
>>>>>>> 0c49f51 (fixed user verification)

    @Column(length = 20)
    private String vehicleType; // SEDAN, SUV, TRUCK, VAN, AUTO, COMMERCIAL, HEAVY_TRUCK

    @Column(name = "current_odometer", columnDefinition = "DECIMAL(10,2)")
    private Double currentOdometer; // Current mileage

    @Column(name = "total_fuel_spent", columnDefinition = "DECIMAL(12,2)")
    private Double totalFuelSpent; // Total amount spent on fuel

    @Column(name = "total_fuel_liters", columnDefinition = "DECIMAL(10,2)")
    private Double totalFuelLiters; // Total liters of fuel consumed

    @Column(name = "fuel_efficiency", columnDefinition = "DECIMAL(5,2)")
    private Double fuelEfficiency; // km/liter or l/100km

    @Column(length = 20)
    private String status; // ACTIVE, INACTIVE, MAINTENANCE, RETIRED

    @Column(name = "registration_date")
    private LocalDate registrationDate; // Vehicle registration date

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate; // Last service date

    @Column(name = "next_service_date")
    private LocalDate nextServiceDate; // Next planned service date

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes; // Additional notes

    @Column(name = "created_at")
    private LocalDate createdAt;

    @Column(name = "updated_at")
    private LocalDate updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
        updatedAt = LocalDate.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDate.now();
    }

    public String getFullName() {
        return make + " " + model + " (" + licensePlate + ")";
    }
}
