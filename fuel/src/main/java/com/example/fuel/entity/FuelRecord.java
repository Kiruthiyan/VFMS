package com.example.fuelmanagement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class FuelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String vehicleId;
    private LocalDate fuelDate;
    private double fuelAmount;
    private double fuelCost;

    public FuelRecord() {}

    public FuelRecord(String vehicleId, LocalDate fuelDate, double fuelAmount, double fuelCost) {
        this.vehicleId = vehicleId;
        this.fuelDate = fuelDate;
        this.fuelAmount = fuelAmount;
        this.fuelCost = fuelCost;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getVehicleId() { return vehicleId; }
    public void setVehicleId(String vehicleId) { this.vehicleId = vehicleId; }

    public LocalDate getFuelDate() { return fuelDate; }
    public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }

    public double getFuelAmount() { return fuelAmount; }
    public void setFuelAmount(double fuelAmount) { this.fuelAmount = fuelAmount; }

    public double getFuelCost() { return fuelCost; }
    public void setFuelCost(double fuelCost) { this.fuelCost = fuelCost; }
}
