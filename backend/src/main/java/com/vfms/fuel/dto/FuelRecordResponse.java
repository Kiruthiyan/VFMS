package com.vfms.fuel.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class FuelRecordResponse {
    private UUID id;
    private UUID vehicleId;
    private String vehiclePlate;
    private String vehicleMakeModel;
    private UUID driverId;
    private String driverName;
    private LocalDate fuelDate;
    private BigDecimal quantity;
    private BigDecimal costPerLitre;
    private BigDecimal totalCost;
    private Double odometerReading;
    private String fuelStation;
    private String notes;
    private String receiptUrl;
    private String receiptFileName;
    private boolean flaggedForMisuse;
    private String flagReason;
    private String createdBy;
    private LocalDateTime createdAt;

    // Calculated fields
    private Double efficiencyKmPerLitre;    // filled by analytics
    private Double distanceSinceLast;        // km since previous entry
}
