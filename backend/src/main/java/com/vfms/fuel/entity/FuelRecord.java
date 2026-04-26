package com.vfms.fuel.entity;

import com.vfms.driver.entity.Driver;
import com.vfms.vehicle.entity.Vehicle;
import jakarta.persistence.*;
import lombok.*;
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

    // ── RELATIONS ─────────────────────────────────────────────────────────

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    // ── FUEL DATA ─────────────────────────────────────────────────────────

    @Column(nullable = false, name = "fuel_date")
    private LocalDate fuelDate;

    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal quantity;        // litres

    @Column(nullable = false, name = "cost_per_litre",
            precision = 8, scale = 2)
    private BigDecimal costPerLitre;

    @Column(nullable = false, name = "total_cost",
            precision = 10, scale = 2)
    private BigDecimal totalCost;

    @Column(nullable = false, name = "odometer_reading")
    private Double odometerReading;     // km at time of fill

    @Column(name = "fuel_station")
    private String fuelStation;

    private String notes;

    // ── RECEIPT ───────────────────────────────────────────────────────────

    @Column(name = "receipt_url")
    private String receiptUrl;

    @Column(name = "receipt_file_name")
    private String receiptFileName;

    // ── MISUSE FLAG ───────────────────────────────────────────────────────

    @Builder.Default
    @Column(name = "flagged_for_misuse")
    private boolean flaggedForMisuse = false;

    @Column(name = "flag_reason")
    private String flagReason;

    // ── TIMESTAMPS ────────────────────────────────────────────────────────

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private String createdBy;          // email of user who added record
}
