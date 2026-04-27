package com.vfms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private Double totalFuelCost;
    private Double totalMaintenanceCost;
    private Double totalDistance;
    private Double avgEfficiency;
    private Long totalVehicles;
    private Map<String, Double> monthlyDistances;
}
