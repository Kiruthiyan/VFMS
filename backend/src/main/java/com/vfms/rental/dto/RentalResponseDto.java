package com.vfms.rental.dto;

import com.vfms.rental.RentalStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RentalResponseDto {
    private Long id;
    private Long vendorId;
    private String vendorName;
    private String vehicleType;
    private String plateNumber;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal costPerDay;
    private BigDecimal totalCost;
    private String purpose;
    private RentalStatus status;
    private String agreementUrl;
    private String invoiceUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
