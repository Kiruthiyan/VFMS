package com.vfms.dsm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "driver_readiness_cache")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverReadinessCache {

    @Id
    @Column(name = "driver_id")
    private UUID driverId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Builder.Default
    @Column(name = "license_valid")
    private Boolean licenseValid = false;

    @Builder.Default
    @Column(name = "all_certs_valid")
    private Boolean allCertsValid = true;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status")
    private DriverAvailability.AvailabilityStatus availabilityStatus = DriverAvailability.AvailabilityStatus.AVAILABLE;

    @Builder.Default
    @Column(name = "last_refreshed")
    private LocalDateTime lastRefreshed = LocalDateTime.now();
}
