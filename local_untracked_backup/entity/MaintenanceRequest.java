package com.vfms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;
    private String licensePlate;
    private String description;
    private String maintenanceType; // ROUTINE_SERVICE, BREAKDOWN, ACCIDENT_DAMAGE
    private String status; // REQUESTED, IN_PROGRESS, COMPLETED, CLOSED
    private Double estimatedCost;
    private Double actualCost;
    private Integer downtimeHours;
    private LocalDateTime requestedDate;
    private LocalDateTime completedDate;
}
