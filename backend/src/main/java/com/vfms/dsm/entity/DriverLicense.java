package com.vfms.dsm.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverLicense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String licenseNumber;

    private LocalDate expiryDate;

    @Enumerated(EnumType.STRING)
    private LicenseStatus status;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    public enum LicenseStatus {
        ACTIVE,
        EXPIRING_SOON,
        EXPIRED
    }
}
