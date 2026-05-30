package com.vfms.maintenance.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.vfms.maintenance.MaintenanceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceRequestDto {

    @NotNull(message = "Vehicle ID is required") 
    private Long vehicleId;

    @NotNull(message = "Maintenance type is required") 
    private MaintenanceType maintenanceType;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;

    @DecimalMin(value = "0.0")
    private BigDecimal estimatedCost;
}
