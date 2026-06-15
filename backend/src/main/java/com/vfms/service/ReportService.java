package com.vfms.service;

import com.vfms.dto.*;
import com.vfms.user.repository.UserRepository;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.maintenance.MaintenanceRepository;
import com.vfms.trip.repository.TripRequestRepository;
import com.vfms.trip.entity.TripRequest;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final TripRequestRepository tripRequestRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final FuelRecordRepository fuelRecordRepository;

    public DashboardStatsDTO getDashboardStats() {
        Long totalVehicles = vehicleRepository.count();

        Map<String, Double> monthlyDistances = new LinkedHashMap<>();
        monthlyDistances.put("Jan", 4000.0);
        monthlyDistances.put("Feb", 3000.0);
        monthlyDistances.put("Mar", 2000.0);
        monthlyDistances.put("Apr", 5000.0);
        monthlyDistances.put("May", 6000.0);

        return DashboardStatsDTO.builder()
                .totalFuelCost(0.0)
                .totalMaintenanceCost(0.0)
                .totalDistance(0.0)
                .avgEfficiency(0.0)
                .totalVehicles(totalVehicles)
                .monthlyDistances(monthlyDistances)
                .build();
    }

    public CostAnalysisDTO getCostAnalysis(LocalDate startDate, LocalDate endDate) {
        return CostAnalysisDTO.builder()
                .totalMaintenanceCost(0.0)
                .totalFuelCost(0.0)
                .maintenanceTrend(new TreeMap<>())
                .fuelTrend(new TreeMap<>())
                .build();
    }

    public List<VehicleUtilizationDTO> getVehicleUtilization() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<TripRequest> trips = tripRequestRepository.findAll();

        return vehicles.stream().map(vehicle -> {
            List<TripRequest> vehicleTrips = trips.stream()
                    .filter(t -> t.getAssignedVehicleId() != null &&
                            t.getAssignedVehicleId().equals(vehicle.getId()))
                    .collect(Collectors.toList());

            double distance = vehicleTrips.stream()
                    .mapToDouble(t -> t.getDistanceKm() != null ? t.getDistanceKm().doubleValue() : 0.0)
                    .sum();

            return VehicleUtilizationDTO.builder()
                    .vehicleId(vehicle.getId())
                    .licensePlate(vehicle.getPlateNumber())
                    .totalDistance(distance)
                    .totalTrips((long) vehicleTrips.size())
                    .fuelConsumed(0.0)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<DriverPerformanceDTO> getDriverPerformance() {
        return userRepository.findAll().stream().map(driver ->
            DriverPerformanceDTO.builder()
                    .driverId(driver.getId())
                    .driverName(driver.getFullName())
                    .totalTrips(0L)
                    .totalDistance(0.0)
                    .rating(0.0)
                    .build()
        ).collect(Collectors.toList());
    }

    public TripStatsDTO getTripStats() {
        List<TripRequest> trips = tripRequestRepository.findAll();

        long total = trips.size();
        long pending = trips.stream().filter(t -> t.getStatus() != null && "PENDING".equalsIgnoreCase(t.getStatus().name())).count();
        long approved = trips.stream().filter(t -> t.getStatus() != null && "APPROVED".equalsIgnoreCase(t.getStatus().name())).count();
        long rejected = trips.stream().filter(t -> t.getStatus() != null && "REJECTED".equalsIgnoreCase(t.getStatus().name())).count();
        long active = trips.stream().filter(t -> t.getStatus() != null && "IN_PROGRESS".equalsIgnoreCase(t.getStatus().name())).count();
        long completed = trips.stream().filter(t -> t.getStatus() != null && "COMPLETED".equalsIgnoreCase(t.getStatus().name())).count();
        long cancelled = trips.stream().filter(t -> t.getStatus() != null && "CANCELLED".equalsIgnoreCase(t.getStatus().name())).count();

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
