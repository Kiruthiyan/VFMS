package com.vfms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Trip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne
    @JoinColumn(name = "driver_id", columnDefinition = "uuid")
    private Driver driver;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Double distance; // in km
    private String startLocation;
    private String endLocation;

    private String status; // PLANNED, IN_PROGRESS, COMPLETED
}
