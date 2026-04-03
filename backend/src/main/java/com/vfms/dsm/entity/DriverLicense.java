package com.vfms.dsm.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "driver_licenses")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverLicense extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "license_number", unique = true, nullable = false)
    private String licenseNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private LicenseCategory category;

    @Column(name = "issuing_authority")
    private String issuingAuthority;

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date", nullable = false)
    private LocalDate expiryDate;

    @Column(name = "document_url")
    private String documentUrl;

    @Builder.Default
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private LicenseStatus status = LicenseStatus.VALID;

    public enum LicenseCategory { A, B, C, CE, D, BE }
    public enum LicenseStatus { VALID, EXPIRING_SOON, EXPIRED }
}
