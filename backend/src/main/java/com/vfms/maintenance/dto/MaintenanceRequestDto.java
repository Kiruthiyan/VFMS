package com.vfms.maintenance.dto;

import com.vfms.maintenance.MaintenanceType;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class MaintenanceRequestDto {

    @NotNull(message = "Vehicle ID is required") private Long vehicleId;

    @NotNull(message = "Maintenance type is required") private MaintenanceType maintenanceType;

    @NotBlank(message = "Description is required")
    @Size(max = 500)
    private String description;

    @DecimalMin(value = "0.0")
    private BigDecimal estimatedCost;
}
