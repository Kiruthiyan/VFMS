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

    // Sedan, Van, SUV, Truck
    private String type;

    // AVAILABLE, IN_USE, MAINTENANCE
    private String status;

    private Integer year;

    // e.g. "75%"
    private String fuelLevel;

    private LocalDate lastServiceDate;

    // Odometer reading in km
    private Double currentOdometer;
}
