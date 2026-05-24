package com.vfms.dsm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "driver_service_requests")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverServiceRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    @JsonIgnore
    private Driver driver;

    @Column(name = "driver_id", insertable = false, updatable = false)
    @JsonIgnore
    private java.util.UUID driverIdValue;

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

    @Transient
    @JsonProperty("driverId")
    public java.util.UUID getDriverId() {
        if (driver != null) {
            return driver.getId();
        }
        return driverIdValue;
    }

    @Transient
    @JsonProperty("requesterId")
    public String getRequesterId() {
        return driver != null ? driver.getEmployeeId() : null;
    }

    public enum RequestType { FAULT_REPORT, SERVICE_REQUEST, INSPECTION_REQUEST }
    public enum Urgency { LOW, MEDIUM, HIGH }
    public enum RequestStatus { OPEN, ACKNOWLEDGED, IN_PROGRESS, RESOLVED }
}