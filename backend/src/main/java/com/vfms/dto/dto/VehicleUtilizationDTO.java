package com.vfms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleUtilizationDTO {
    private Long vehicleId;
    private String licensePlate;
    private Double totalDistance; // km
    private Long totalTrips;
    private Double fuelConsumed;
}
