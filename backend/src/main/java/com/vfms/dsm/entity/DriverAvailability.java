package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_availability")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverAvailability {

    @Id
    @Column(name = "driver_id")
    private UUID driverId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AvailabilityStatus status = AvailabilityStatus.AVAILABLE;

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by")
    private String updatedBy;

    @Column(name = "reason")
    private String reason;

    public enum AvailabilityStatus {
        AVAILABLE,
        ON_TRIP,
        ON_LEAVE,
        INACTIVE
    }
}
