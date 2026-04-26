package com.vfms.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDate;

import com.vfms.vehicle.FuelType;
import com.vfms.vehicle.VehicleType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequestDto {

    @NotBlank(message = "Plate number is required")
    @Size(max = 20)
    private String plateNumber;

    @NotBlank(message = "Brand is required")
    @Size(max = 50)
    private String brand;

    @NotBlank(message = "Model is required")
    @Size(max = 50)
    private String model;

    @NotNull(message = "Year is required") 
    @Min(value = 1980, message = "Year must be 1980 or later")
    @Max(value = 2100)
    private Integer year;

    @NotNull(message = "Vehicle type is required") 
    private VehicleType vehicleType;

    @NotNull(message = "Fuel type is required") 
    private FuelType fuelType;

    @Size(max = 100)
    private String department;

    @Size(max = 30)
    private String color;

    @Min(value = 1)
    @Max(value = 100)
    private Integer seatingCapacity;

    private LocalDate insuranceExpiryDate;

    private LocalDate revenueLicenseExpiryDate;
}
