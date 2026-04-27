package com.vfms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "drivers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private java.util.UUID id;

    private String name;
    private String licenseNumber;
    private String department;
    private LocalDate joiningDate;
    
    private String licenseStatus; // VALID, EXPIRED, PENDING
    private Double rating; // 0.0 to 5.0
    private Integer totalTrips;
    private Double totalDistance;
    private Integer infractions;
}
