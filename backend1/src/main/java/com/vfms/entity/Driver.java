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
    @Column(columnDefinition = "uuid")
    private java.util.UUID id;

    @Column(name = "name")
    private String name;

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "department")
    private String department;

    @Column(name = "joining_date")
    private LocalDate joiningDate;

    @Column(name = "license_status")
    private String licenseStatus;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "total_trips")
    private Integer totalTrips;

    @Column(name = "total_distance")
    private Double totalDistance;

    @Column(name = "infractions")
    private Integer infractions;
}
