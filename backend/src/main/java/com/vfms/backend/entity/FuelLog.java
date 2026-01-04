package com.vfms.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "fuel_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long vehicleId;

    @Column(nullable = false)
    private Double fuelQuantity;

    @Column(nullable = false)
    private Double cost;

    @Column(nullable = false)
    private LocalDate date;

    private String receiptUrl;

    @Column(nullable = false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
}

