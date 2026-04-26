package com.vfms.vehicle.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.vfms.vehicle.FuelType;
import com.vfms.vehicle.VehicleStatus;
import com.vfms.vehicle.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
