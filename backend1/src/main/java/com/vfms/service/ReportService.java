package com.vfms.service;

import com.vfms.dto.*;
import com.vfms.entity.*;
import com.vfms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRequestRepository tripRequestRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final FuelLogRepository fuelLogRepository;

    public DashboardStatsDTO getDashboardStats() {
        Double totalFuelCost = fuelLogRepository.getTotalFuelSpend();
        Double totalFuelQuantity = fuelLogRepository.getTotalFuelConsumption();

        List<MaintenanceLog> maintenanceLogs = maintenanceLogRepository.findAll();
        Double totalMaintenanceCost = maintenanceLogs.stream().mapToDouble(MaintenanceLog::getCost).sum();

        Double totalDistance = vehicleRepository.getTotalFleetDistance();
        Long totalVehicles = vehicleRepository.count();

        Double avgEfficiency = (totalDistance != null && totalFuelQuantity != null && totalFuelQuantity > 0)
                ? totalDistance / totalFuelQuantity : 0.0;

        Map<String, Double> monthlyDistances = new LinkedHashMap<>();
        monthlyDistances.put("Jan", 4000.0);
        monthlyDistances.put("Feb", 3000.0);
        monthlyDistances.put("Mar", 2000.0);
        monthlyDistances.put("Apr", totalDistance != null ? totalDistance / 2 : 0.0);
        monthlyDistances.put("May", totalDistance != null ? totalDistance : 0.0);

        return DashboardStatsDTO.builder()
                .totalFuelCost(totalFuelCost != null ? totalFuelCost : 0.0)
                .totalMaintenanceCost(totalMaintenanceCost)
                .totalDistance(totalDistance != null ? totalDistance : 0.0)
                .avgEfficiency(avgEfficiency)
                .totalVehicles(totalVehicles)
                .monthlyDistances(monthlyDistances)
                .build();
    }

    public CostAnalysisDTO getCostAnalysis(LocalDate startDate, LocalDate endDate) {
        List<MaintenanceLog> maintenanceLogs = maintenanceLogRepository.findByMaintenanceDateBetween(startDate, endDate);
        List<FuelLog> fuelLogs = fuelLogRepository.findByDateBetween(startDate, endDate);

        Double totalMaintenanceCost = maintenanceLogs.stream().mapToDouble(MaintenanceLog::getCost).sum();
        Double totalFuelCost = fuelLogs.stream().mapToDouble(FuelLog::getTotalCost).sum();

        Map<String, Double> maintenanceTrend = new TreeMap<>();
        maintenanceLogs.forEach(log -> {
            String date = log.getMaintenanceDate().toString();
            maintenanceTrend.put(date, maintenanceTrend.getOrDefault(date, 0.0) + log.getCost());
        });

        Map<String, Double> fuelTrend = new TreeMap<>();
        fuelLogs.forEach(log -> {
            String date = log.getDate().toString();
            fuelTrend.put(date, fuelTrend.getOrDefault(date, 0.0) + log.getTotalCost());
        });

        return CostAnalysisDTO.builder()
                .totalMaintenanceCost(totalMaintenanceCost)
                .totalFuelCost(totalFuelCost)
                .maintenanceTrend(maintenanceTrend)
                .fuelTrend(fuelTrend)
                .build();
    }

    public List<VehicleUtilizationDTO> getVehicleUtilization() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<TripRequest> trips = tripRequestRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();

        return vehicles.stream().map(vehicle -> {
            List<TripRequest> vehicleTrips = trips.stream()
                    .filter(t -> t.getVehicleId() != null && t.getVehicleId().equals(vehicle.getId()))
                    .collect(Collectors.toList());

            Double distance = vehicleTrips.stream()
                    .mapToDouble(t -> t.getDistanceKm() != null ? t.getDistanceKm() : 0.0)
                    .sum();

            Double fuel = fuelLogs.stream()
                    .filter(f -> f.getVehicle() != null && f.getVehicle().getId().equals(vehicle.getId()))
                    .mapToDouble(FuelLog::getFuelQuantity)
                    .sum();

            return VehicleUtilizationDTO.builder()
                    .vehicleId(vehicle.getId())
                    .licensePlate(vehicle.getLicensePlate())
                    .totalDistance(distance)
                    .totalTrips((long) vehicleTrips.size())
                    .fuelConsumed(fuel)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<DriverPerformanceDTO> getDriverPerformance() {
        List<Driver> drivers = driverRepository.findAll();
        List<TripRequest> trips = tripRequestRepository.findAll();

        return drivers.stream().map(driver -> {
            List<TripRequest> driverTrips = trips.stream()
                    .filter(t -> t.getAssignedDriverId() != null &&
                            t.getAssignedDriverId().toString().equals(driver.getId().toString()))
                    .collect(Collectors.toList());

            Double distance = driverTrips.stream()
                    .mapToDouble(t -> t.getDistanceKm() != null ? t.getDistanceKm() : 0.0)
                    .sum();

            return DriverPerformanceDTO.builder()
                    .driverId(driver.getId())
                    .driverName(driver.getName())
                    .totalTrips((long) driverTrips.size())
                    .totalDistance(distance)
                    .rating(driver.getRating())
                    .build();
        }).collect(Collectors.toList());
    }

    public TripStatsDTO getTripStats() {
        List<TripRequest> trips = tripRequestRepository.findAll();

        long total = trips.size();
        long pending = trips.stream().filter(t -> "PENDING".equalsIgnoreCase(t.getStatus())).count();
        long approved = trips.stream().filter(t -> "APPROVED".equalsIgnoreCase(t.getStatus())).count();
        long rejected = trips.stream().filter(t -> "REJECTED".equalsIgnoreCase(t.getStatus())).count();
        long active = trips.stream().filter(t -> "IN_PROGRESS".equalsIgnoreCase(t.getStatus())).count();
        long completed = trips.stream().filter(t -> "COMPLETED".equalsIgnoreCase(t.getStatus())).count();
        long cancelled = trips.stream().filter(t -> "CANCELLED".equalsIgnoreCase(t.getStatus())).count();

        return TripStatsDTO.builder()
                .total(total)
                .pending(pending)
                .approved(approved)
                .rejected(rejected)
                .active(active)
                .completed(completed)
                .cancelled(cancelled)
                .build();
    }
}