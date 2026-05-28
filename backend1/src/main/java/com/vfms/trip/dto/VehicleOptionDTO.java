package com.vfms.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VehicleOptionDTO {
    private Long id;
    private String brand;
    private String model;
    private String plateNumber;
}
