package com.vfms.service;

import com.vfms.dto.DashboardStatsDTO;
import com.vfms.repository.FuelLogRepository;
import com.vfms.repository.MaintenanceRequestRepository;
import com.vfms.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    @Autowired
    private FuelLogRepository fuelRepo;

    @Autowired
    private MaintenanceRequestRepository maintenanceRepo;

    @Autowired
    private VehicleRepository vehicleRepo;

    public DashboardStatsDTO getStats() {
        Double fuelCost = fuelRepo.getTotalFuelSpend();
        Double maintenanceCost = maintenanceRepo.getTotalMaintenanceCost();
        Double distance = vehicleRepo.getTotalFleetDistance();
        Long totalVehicles = vehicleRepo.count();
        
        // Mocking efficiency calculation for now
        Double fuelVolume = fuelRepo.getTotalFuelConsumption();
        Double efficiency = (distance != null && fuelVolume != null && fuelVolume > 0) ? (distance / fuelVolume) : 0.0;

        // Populate monthly data (simulated based on total for now, or could be queried)
        java.util.Map<String, Double> monthlyData = new java.util.LinkedHashMap<>();
        monthlyData.put("Jan", 4000.0);
        monthlyData.put("Feb", 3000.0);
        monthlyData.put("Mar", 2000.0);
        monthlyData.put("Apr", distance != null ? distance / 2 : 0.0);
        monthlyData.put("May", distance != null ? distance : 0.0);

        return DashboardStatsDTO.builder()
                .totalFuelCost(fuelCost != null ? fuelCost : 0.0)
                .totalMaintenanceCost(maintenanceCost != null ? maintenanceCost : 0.0)
                .totalDistance(distance != null ? distance : 0.0)
                .avgEfficiency(efficiency)
                .totalVehicles(totalVehicles)
                .monthlyDistances(monthlyData)
                .build();
    }
}
