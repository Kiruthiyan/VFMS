package trip_service.entity;

import trip_service.enums.TripStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// Core domain entity mapped to the "trip_requests" database table
@Entity
@Table(name = "trip_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "requester_id", nullable = false)
    private UUID requesterId;

    // Requested trip parameters
    @Column(name = "purpose", nullable = false, length = 500)
    private String purpose;

    @Column(name = "destination", nullable = false)
    private String destination;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "return_time", nullable = false)
    private LocalDateTime returnTime;

    @Column(name = "passenger_count")
    private Integer passengerCount = 1;

    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;

    // Tracks the current lifecycle state of the trip
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TripStatus status = TripStatus.NEW;

    // Resource and administrative assignments (typically populated post-approval)
    @Column(name = "vehicle_id")
    private Long assignedVehicleId;

    @Column(name = "driver_id")
    private UUID assignedDriverId;

    @Column(name = "approver_id")
    private UUID approverId;

    @Column(name = "approval_notes", columnDefinition = "TEXT")
    private String approvalNotes;

    // Actual trip execution times (distinct from requested departure/return times)
    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    // Automatic audit timestamps managed by Hibernate
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}