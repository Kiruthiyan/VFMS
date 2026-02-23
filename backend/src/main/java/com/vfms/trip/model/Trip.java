package com.vfms.trip.model;

import com.vfms.auth.model.User;
import com.vfms.vehicle.model.Vehicle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "trips")
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
    @JoinColumn(name = "driver_id")
    private User driver;

    private String destination;
    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    private LocalDateTime scheduledTime;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer startMileage;
    private Integer endMileage;
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
