package com.vfms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverPerformanceDTO {
    private java.util.UUID driverId;
    private String driverName;
    private Long totalTrips;
    private Double totalDistance;
    private Double rating;
}
