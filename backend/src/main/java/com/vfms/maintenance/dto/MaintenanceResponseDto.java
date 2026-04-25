package com.vfms.maintenance.dto;

import com.vfms.maintenance.MaintenanceStatus;
import com.vfms.maintenance.MaintenanceType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MaintenanceResponseDto {
    private Long id;
    private Long vehicleId;
    private String vehiclePlateNumber;
    private String vehicleBrandModel;
    private MaintenanceType maintenanceType;
    private String description;
    private MaintenanceStatus status;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private LocalDateTime requestedDate;
    private LocalDateTime approvedDate;
    private LocalDateTime closedDate;
    private String rejectionReason;
    private String quotationUrl;
    private String invoiceUrl;
    private Long downtimeHours;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
