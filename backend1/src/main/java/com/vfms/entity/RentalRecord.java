package com.vfms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "rental_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    private String licensePlate;
    private String vehicleType;
    private String customerName;
    private String customerPhone;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer days;
    private Double costPerDay;
    private Double totalCost;
    private String status; // Active, Completed, Cancelled
    private String purpose;
    private String vendorId;
}
