package com.vfms.vehicle.dto;

import com.vfms.vehicle.*;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class VehicleResponseDto {
    private Long id;
    private String plateNumber;
    private String brand;
    private String model;
    private Integer year;
    private VehicleType vehicleType;
    private FuelType fuelType;
    private VehicleStatus status;
    private String department;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
