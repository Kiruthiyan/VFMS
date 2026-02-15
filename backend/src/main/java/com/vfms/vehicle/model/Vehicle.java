package com.vfms.vehicle.model;

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
@Table(name = "vehicle")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String make;
    private String model;

    @Column(unique = true)
    private String licensePlate;

    // Sedan, Van, SUV, Truck, Bus
    private String category;

    // AVAILABLE, MAINTENANCE, ON_TRIP, RENTED, INACTIVE
    private String status;

    private Integer year;

    // e.g. "PETROL", "DIESEL", "ELECTRIC", "HYBRID"
    private String fuelType;

    // e.g. "75%"
    private String fuelLevel;

    private LocalDate lastServiceDate;

    // Odometer reading in km
    private Double currentOdometer;
}
