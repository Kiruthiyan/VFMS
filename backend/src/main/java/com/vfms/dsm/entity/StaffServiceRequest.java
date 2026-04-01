package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "staff_service_requests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffServiceRequest extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(name = "vehicle_id")
    private Long vehicleId;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", nullable = false)
    private RequestType requestType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false)
    @Builder.Default
    private Urgency urgency = Urgency.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.OPEN;

    public enum RequestType { FAULT_REPORT, SERVICE_REQUEST, INSPECTION_REQUEST }
    public enum Urgency { LOW, MEDIUM, HIGH }
    public enum RequestStatus { OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED }
}
