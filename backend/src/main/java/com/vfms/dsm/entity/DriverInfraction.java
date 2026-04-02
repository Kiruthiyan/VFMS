package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "driver_infractions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverInfraction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "infraction_type", nullable = false)
    private InfractionType infractionType;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private Severity severity;

    @Column(name = "incident_date", nullable = false)
    private LocalDate incidentDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolution_status", nullable = false)
    @Builder.Default
    private ResolutionStatus resolutionStatus = ResolutionStatus.OPEN;

    @Column(name = "resolved_at")
    private LocalDate resolvedAt;

    @Column(name = "penalty_notes")
    private String penaltyNotes;

    public enum InfractionType {
        TRAFFIC_VIOLATION,
        MINOR_ACCIDENT,
        MAJOR_ACCIDENT,
        NEAR_MISS,
        RECKLESS_DRIVING,
        OTHER
    }

    public enum Severity {
        LOW,
        MEDIUM,
        HIGH,
        CRITICAL
    }

    public enum ResolutionStatus {
        OPEN,
        UNDER_REVIEW,
        RESOLVED
    }
}
