package com.vfms.dsm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trip_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnore
    private Driver driver;

    @Column(name = "driver_id", insertable = false, updatable = false)
    private UUID driverId;

    @Column(name = "departure_time", nullable = false)
    private LocalDateTime departureTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TripStatus status = TripStatus.SCHEDULED;

    @Column(name = "origin", columnDefinition = "TEXT")
    private String origin;

    @Column(name = "destination", columnDefinition = "TEXT")
    private String destination;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum TripStatus {
        SCHEDULED,
        DRIVER_CONFIRMED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }
}
