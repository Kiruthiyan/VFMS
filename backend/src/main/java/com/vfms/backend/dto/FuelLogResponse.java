package com.vfms.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FuelLogResponse {
    private Long id;
    private Long vehicleId;
    private String vehicleName;
    private Double fuelQuantity;
    private Double cost;
    private LocalDate date;
    private String receiptUrl;
}

