package com.vfms.fuel.entity;

import com.vfms.driver.entity.Driver;
import com.vfms.vehicle.entity.Vehicle;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fuel_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FuelRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Column(nullable = false, name = "fuel_date")
    private LocalDate fuelDate;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, name = "cost_per_litre", precision = 8, scale = 2)
    private BigDecimal costPerLitre;

    @Column(nullable = false, name = "total_cost", precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false, name = "odometer_reading")
    private Double odometerReading;

    @Column(name = "fuel_station")
    private String fuelStation;

    private String notes;

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "receipt_file_name")
    private String receiptFileName;

    @Builder.Default
    @Column(name = "flagged_for_misuse")
    private boolean flaggedForMisuse = false;

    @Column(name = "flag_reason")
    private String flagReason;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;
}
