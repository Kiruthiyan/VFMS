package com.vfms.backend.service;

import com.vfms.backend.dto.FuelLogRequest;
import com.vfms.backend.dto.FuelLogResponse;
import com.vfms.backend.entity.FuelLog;
import com.vfms.backend.repository.FuelLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuelService {

    private final FuelLogRepository fuelLogRepository;
    private static final String UPLOAD_DIR = "uploads/receipts/";

    @Transactional
    public FuelLogResponse addFuelLog(FuelLogRequest request, MultipartFile receipt) {
        FuelLog fuelLog = new FuelLog();
        fuelLog.setVehicleId(request.getVehicleId());
        fuelLog.setFuelQuantity(request.getFuelQuantity());
        fuelLog.setCost(request.getCost());
        fuelLog.setDate(request.getDate());

        if (receipt != null && !receipt.isEmpty()) {
            String receiptUrl = saveReceipt(receipt);
            fuelLog.setReceiptUrl(receiptUrl);
        }

        FuelLog saved = fuelLogRepository.save(fuelLog);
        return toResponse(saved);
    }

    public List<FuelLogResponse> getFuelHistory(Long vehicleId, String month) {
        List<FuelLog> logs;
        
        if (vehicleId != null && month != null) {
            YearMonth yearMonth = YearMonth.parse(month);
            logs = fuelLogRepository.findByVehicleIdAndMonth(
                vehicleId, 
                yearMonth.getYear(), 
                yearMonth.getMonthValue()
            );
        } else if (vehicleId != null) {
            logs = fuelLogRepository.findByVehicleId(vehicleId);
        } else if (month != null) {
            YearMonth yearMonth = YearMonth.parse(month);
            logs = fuelLogRepository.findByMonth(
                yearMonth.getYear(), 
                yearMonth.getMonthValue()
            );
        } else {
            logs = fuelLogRepository.findAll();
        }

        return logs.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public Object getFuelSummary() {
        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.from(now);
        
        List<FuelLog> currentMonthLogs = fuelLogRepository.findByMonth(
            currentMonth.getYear(), 
            currentMonth.getMonthValue()
        );

        double totalCost = currentMonthLogs.stream()
            .mapToDouble(FuelLog::getCost)
            .sum();

        // Find highest consuming vehicle (simplified - would need vehicle data)
        String highestVehicle = currentMonthLogs.stream()
            .collect(Collectors.groupingBy(
                FuelLog::getVehicleId,
                Collectors.summingDouble(FuelLog::getFuelQuantity)
            ))
            .entrySet()
            .stream()
            .max(java.util.Map.Entry.comparingByValue())
            .map(e -> "Vehicle " + e.getKey())
            .orElse("N/A");

        // Simple trend calculation (compare with previous month)
        YearMonth previousMonth = currentMonth.minusMonths(1);
        List<FuelLog> previousMonthLogs = fuelLogRepository.findByMonth(
            previousMonth.getYear(),
            previousMonth.getMonthValue()
        );
        
        double currentTotal = currentMonthLogs.stream()
            .mapToDouble(FuelLog::getFuelQuantity)
            .sum();
        double previousTotal = previousMonthLogs.stream()
            .mapToDouble(FuelLog::getFuelQuantity)
            .sum();

        String trend = currentTotal > previousTotal ? "up" : 
                      currentTotal < previousTotal ? "down" : "stable";

        return Map.of(
            "totalCostThisMonth", totalCost,
            "highestFuelConsumingVehicle", highestVehicle,
            "fuelUsageTrend", trend
        );
    }

    public Object getFuelAnalytics() {
        LocalDate now = LocalDate.now();
        List<FuelLog> allLogs = fuelLogRepository.findAll();

        // Monthly consumption for last 6 months
        List<Map<String, Object>> monthlyConsumption = new java.util.ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(now.minusMonths(i));
            List<FuelLog> monthLogs = fuelLogRepository.findByMonth(
                month.getYear(),
                month.getMonthValue()
            );
            double consumption = monthLogs.stream()
                .mapToDouble(FuelLog::getFuelQuantity)
                .sum();
            monthlyConsumption.add(Map.of(
                "month", month.toString(),
                "consumption", consumption
            ));
        }

        // Cost comparison per vehicle
        Map<Long, Double> vehicleCosts = allLogs.stream()
            .collect(Collectors.groupingBy(
                FuelLog::getVehicleId,
                Collectors.summingDouble(FuelLog::getCost)
            ));

        List<Map<String, Object>> costComparison = vehicleCosts.entrySet().stream()
            .map(e -> Map.<String, Object>of(
                "vehicleName", "Vehicle " + e.getKey(),
                "cost", e.getValue()
            ))
            .collect(Collectors.toList());

        // Average mileage (simplified calculation)
        double averageMileage = 12.5; // Placeholder - would need trip data

        // Alerts for unusual consumption
        List<Map<String, String>> alerts = new java.util.ArrayList<>();
        // Simplified alert logic
        vehicleCosts.forEach((vehicleId, cost) -> {
            if (cost > 50000) { // Threshold
                alerts.add(Map.of(
                    "vehicleName", "Vehicle " + vehicleId,
                    "message", "High fuel consumption detected"
                ));
            }
        });

        return Map.of(
            "monthlyConsumption", monthlyConsumption,
            "costComparison", costComparison,
            "averageMileage", averageMileage,
            "alerts", alerts
        );
    }

    private String saveReceipt(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/receipts/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to save receipt", e);
        }
    }

    private FuelLogResponse toResponse(FuelLog log) {
        FuelLogResponse response = new FuelLogResponse();
        response.setId(log.getId());
        response.setVehicleId(log.getVehicleId());
        response.setVehicleName("Vehicle " + log.getVehicleId()); // Would fetch from vehicle service
        response.setFuelQuantity(log.getFuelQuantity());
        response.setCost(log.getCost());
        response.setDate(log.getDate());
        response.setReceiptUrl(log.getReceiptUrl());
        return response;
    }
}

