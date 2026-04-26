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
<<<<<<< HEAD

    // Explicit accessors (keeps builds resilient even if Lombok processing is misconfigured)
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }
    public Driver getDriver() { return driver; }
    public void setDriver(Driver driver) { this.driver = driver; }
    public LocalDate getFuelDate() { return fuelDate; }
    public void setFuelDate(LocalDate fuelDate) { this.fuelDate = fuelDate; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    public BigDecimal getCostPerLitre() { return costPerLitre; }
    public void setCostPerLitre(BigDecimal costPerLitre) { this.costPerLitre = costPerLitre; }
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    public Double getOdometerReading() { return odometerReading; }
    public void setOdometerReading(Double odometerReading) { this.odometerReading = odometerReading; }
    public String getFuelStation() { return fuelStation; }
    public void setFuelStation(String fuelStation) { this.fuelStation = fuelStation; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }
    public String getReceiptFileName() { return receiptFileName; }
    public void setReceiptFileName(String receiptFileName) { this.receiptFileName = receiptFileName; }
    public boolean isFlaggedForMisuse() { return flaggedForMisuse; }
    public void setFlaggedForMisuse(boolean flaggedForMisuse) { this.flaggedForMisuse = flaggedForMisuse; }
    public String getFlagReason() { return flagReason; }
    public void setFlagReason(String flagReason) { this.flagReason = flagReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
=======
>>>>>>> origin/feature/user-management
}
