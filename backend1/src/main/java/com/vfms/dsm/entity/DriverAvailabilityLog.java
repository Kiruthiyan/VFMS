package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_availability_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverAvailabilityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "driver_id")
    private UUID driverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status")
    private DriverAvailability.AvailabilityStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status")
    private DriverAvailability.AvailabilityStatus newStatus;

    @Column(name = "changed_at")
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "reason")
    private String reason;
}
