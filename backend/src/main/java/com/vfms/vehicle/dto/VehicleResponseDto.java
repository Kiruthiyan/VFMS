package com.vfms.vehicle.dto;

import com.vfms.vehicle.FuelType;
import com.vfms.vehicle.VehicleStatus;
import com.vfms.vehicle.VehicleType;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

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
    private String color;
    private Integer seatingCapacity;
    private LocalDate insuranceExpiryDate;
    private LocalDate revenueLicenseExpiryDate;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
