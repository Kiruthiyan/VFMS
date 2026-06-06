package com.vfms.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class CostAnalysisDTO {
    private Double totalMaintenanceCost;
    private Double totalFuelCost;
    private Map<String, Double> maintenanceTrend; // Date -> Cost
    private Map<String, Double> fuelTrend; // Date -> Cost
}
