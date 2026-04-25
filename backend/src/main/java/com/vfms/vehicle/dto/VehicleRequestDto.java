package com.vfms.vehicle.dto;

import com.vfms.vehicle.FuelType;
import com.vfms.vehicle.VehicleType;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import lombok.Data;

@Data
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

    @NotNull(message = "Year is required") @Min(value = 1980, message = "Year must be 1980 or later")
    @Max(value = 2100)
    private Integer year;

    @NotNull(message = "Vehicle type is required") private VehicleType vehicleType;

    @NotNull(message = "Fuel type is required") private FuelType fuelType;

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
