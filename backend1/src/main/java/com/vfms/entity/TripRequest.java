package com.vfms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trip_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "driver_id", columnDefinition = "uuid")
    private UUID driverId;

    @Column(name = "requester_id", columnDefinition = "uuid")
    private UUID requesterId;

    @Column(name = "approver_id", columnDefinition = "uuid")
    private UUID approverId;

    @Column(name = "assigned_driver_id", columnDefinition = "uuid")
    private UUID assignedDriverId;

    @Column(name = "assigned_vehicle_id", columnDefinition = "uuid")
    private UUID assignedVehicleId;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    private String destination;
    private String purpose;
    private String status;

    @Column(name = "approval_notes")
    private String approvalNotes;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "passenger_count")
    private Integer passengerCount;

    @Column(name = "departure_time")
    private LocalDateTime departureTime;

    @Column(name = "return_time")
    private LocalDateTime returnTime;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}