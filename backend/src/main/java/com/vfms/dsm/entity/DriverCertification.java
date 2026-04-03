package com.vfms.dsm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "driver_certifications")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverCertification extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Enumerated(EnumType.STRING)
    @Column(name = "cert_type", nullable = false)
    private CertificationType certType;

    @Column(name = "cert_name", nullable = false)
    private String certName;

    @Column(name = "issued_by")
    private String issuedBy;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "document_url")
    private String documentUrl;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CertStatus status = CertStatus.VALID;

    public enum CertificationType {
        DEFENSIVE_DRIVING,
        FIRST_AID,
        HAZMAT,
        HEAVY_VEHICLE,
        PASSENGER_TRANSPORT,
        OTHER
    }

    public enum CertStatus {
        VALID,
        EXPIRING_SOON,
        EXPIRED
    }
}
