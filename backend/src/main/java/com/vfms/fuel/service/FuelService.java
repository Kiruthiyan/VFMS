package com.vfms.fuel.service;

import com.vfms.driver.entity.Driver;
import com.vfms.driver.repository.DriverRepository;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.vehicle.entity.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FuelService {

    private final FuelRecordRepository fuelRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final FuelStorageService fuelStorageService;
    private final FuelMisuseService fuelMisuseService;

    // ── CREATE FUEL ENTRY ────────────────────────────────────────────────

    @Transactional
    public FuelRecordResponse createFuelRecord(
            CreateFuelRecordRequest request,
            MultipartFile receipt,
            UserDetails currentUser) {

        // Validate vehicle
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() ->
                        new RuntimeException("Vehicle not found"));

        // Optional driver
        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() ->
                            new RuntimeException("Driver not found"));
        }

        // Calculate total cost
        BigDecimal totalCost = request.getQuantity()
                .multiply(request.getCostPerLitre())
                .setScale(2, RoundingMode.HALF_UP);

        // Build record
        FuelRecord record = FuelRecord.builder()
                .vehicle(vehicle)
                .driver(driver)
                .fuelDate(LocalDate.parse(request.getFuelDate()))
                .quantity(request.getQuantity())
                .costPerLitre(request.getCostPerLitre())
                .totalCost(totalCost)
                .odometerReading(request.getOdometerReading())
                .fuelStation(request.getFuelStation())
                .notes(request.getNotes())
                .createdBy(currentUser.getUsername())
                .flaggedForMisuse(false)
                .build();

        // Upload receipt if provided
        if (receipt != null && !receipt.isEmpty()) {
            String receiptUrl = fuelStorageService.uploadReceipt(receipt);
            record.setReceiptUrl(receiptUrl);
            record.setReceiptFileName(receipt.getOriginalFilename());
        }

        // Check for misuse
        String flagReason = fuelMisuseService.checkForMisuse(record);
        if (flagReason != null) {
            record.setFlaggedForMisuse(true);
            record.setFlagReason(flagReason);
        }

        FuelRecord saved = fuelRecordRepository.save(record);

        // Update vehicle odometer
        vehicle.setOdometerReading(request.getOdometerReading());
        vehicleRepository.save(vehicle);

        return toResponse(saved);
    }

    // ── GET ALL ───────────────────────────────────────────────────────────

    public List<FuelRecordResponse> getAllRecords() {
        return fuelRecordRepository.findAllByOrderByFuelDateDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────

    public FuelRecordResponse getById(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Fuel record not found"));
        return toResponse(record);
    }

    // ── GET BY VEHICLE ────────────────────────────────────────────────────

    public List<FuelRecordResponse> getByVehicle(UUID vehicleId) {
        return fuelRecordRepository
                .findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET BY DRIVER ─────────────────────────────────────────────────────

    public List<FuelRecordResponse> getByDriver(UUID driverId) {
        return fuelRecordRepository
                .findByDriverIdOrderByFuelDateDesc(driverId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET FLAGGED ───────────────────────────────────────────────────────

    public List<FuelRecordResponse> getFlaggedRecords() {
        return fuelRecordRepository.findAllFlaggedRecords()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── GET BY DATE RANGE ─────────────────────────────────────────────────

    public List<FuelRecordResponse> getByDateRange(
            String from, String to,
            UUID vehicleId, UUID driverId) {

        LocalDate fromDate = LocalDate.parse(from);
        LocalDate toDate = LocalDate.parse(to);

        List<FuelRecord> records;

        if (vehicleId != null) {
            records = fuelRecordRepository
                    .findByVehicleAndDateRange(vehicleId, fromDate, toDate);
        } else if (driverId != null) {
            records = fuelRecordRepository
                    .findByDriverAndDateRange(driverId, fromDate, toDate);
        } else {
            records = fuelRecordRepository
                    .findByDateRange(fromDate, toDate);
        }

        return records.stream()
                .map(this::toResponseWithEfficiency)
                .collect(Collectors.toList());
    }

    // ── TO RESPONSE ───────────────────────────────────────────────────────

    FuelRecordResponse toResponse(FuelRecord r) {
        return FuelRecordResponse.builder()
                .id(r.getId())
                .vehicleId(r.getVehicle().getId())
                .vehiclePlate(r.getVehicle().getPlateNumber())
                .vehicleMakeModel(r.getVehicle().getMake()
                        + " " + r.getVehicle().getModel())
                .driverId(r.getDriver() != null
                        ? r.getDriver().getId() : null)
                .driverName(r.getDriver() != null
                        ? r.getDriver().getFullName() : null)
                .fuelDate(r.getFuelDate())
                .quantity(r.getQuantity())
                .costPerLitre(r.getCostPerLitre())
                .totalCost(r.getTotalCost())
                .odometerReading(r.getOdometerReading())
                .fuelStation(r.getFuelStation())
                .notes(r.getNotes())
                .receiptUrl(r.getReceiptUrl())
                .receiptFileName(r.getReceiptFileName())
                .flaggedForMisuse(r.isFlaggedForMisuse())
                .flagReason(r.getFlagReason())
                .createdBy(r.getCreatedBy())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private FuelRecordResponse toResponseWithEfficiency(FuelRecord r) {
        FuelRecordResponse resp = toResponse(r);

        // Calculate km/L using distance from previous entry
        List<FuelRecord> vehicleRecords = fuelRecordRepository
                .findLatestByVehicle(r.getVehicle().getId());

        // Find the entry just before this one
        for (int i = 0; i < vehicleRecords.size(); i++) {
            if (vehicleRecords.get(i).getId().equals(r.getId())
                    && i + 1 < vehicleRecords.size()) {
                FuelRecord prev = vehicleRecords.get(i + 1);
                double distance = r.getOdometerReading()
                        - prev.getOdometerReading();
                if (distance > 0) {
                    double efficiency = distance
                            / r.getQuantity().doubleValue();
                    resp.setEfficiencyKmPerLitre(
                            Math.round(efficiency * 100.0) / 100.0);
                    resp.setDistanceSinceLast(distance);
                }
                break;
            }
        }

        return resp;
    }
}
