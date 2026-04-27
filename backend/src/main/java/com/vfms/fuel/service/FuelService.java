package com.vfms.fuel.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.driver.entity.Driver;
import com.vfms.driver.repository.DriverRepository;
import com.vfms.fuel.client.VehicleApiClient;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelFormMetadataResponse;
import com.vfms.fuel.dto.FuelLookupOptionResponse;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.dto.PatchFuelRecordRequest;
import com.vfms.fuel.dto.VehicleDetailDto;
import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.vehicle.entity.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FuelService {

    private static final String MANUAL_FLAG_REASON = "Manually flagged by admin";

    private final FuelRecordRepository fuelRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final VehicleApiClient vehicleApiClient;
    private final FuelStorageService fuelStorageService;
    private final FuelMisuseService fuelMisuseService;

    @Transactional
    public FuelRecordResponse createFuelRecord(
            CreateFuelRecordRequest request,
            MultipartFile receipt,
            UserDetails currentUser) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found: " + request.getVehicleId()));

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));
        }

        FuelRecord record = FuelRecord.builder()
                .vehicle(vehicle)
                .driver(driver)
                .fuelDate(request.getFuelDate())
                .quantity(request.getQuantity())
                .costPerLitre(request.getCostPerLitre())
                .totalCost(calculateTotalCost(request.getQuantity(), request.getCostPerLitre()))
                .odometerReading(request.getOdometerReading())
                .fuelStation(request.getFuelStation())
                .notes(request.getNotes())
                .createdBy(currentUser.getUsername())
                .flaggedForMisuse(false)
                .build();

        if (receipt != null && !receipt.isEmpty()) {
            String receiptUrl = fuelStorageService.uploadReceipt(receipt);
            record.setReceiptUrl(receiptUrl);
            record.setReceiptFileName(receipt.getOriginalFilename());
        }

        reEvaluateMisuse(record);

        FuelRecord saved = fuelRecordRepository.save(record);
        vehicle.setOdometerReading(request.getOdometerReading());
        vehicleRepository.save(vehicle);

        return toResponse(saved);
    }

    public List<FuelRecordResponse> getAllRecords() {
        return fuelRecordRepository.findAllByOrderByFuelDateDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FuelRecordResponse> getAllRecordsWithRealTimeData() {
        return fuelRecordRepository.findAllByOrderByFuelDateDesc()
                .stream()
                .map(this::toResponseWithRealTimeData)
                .collect(Collectors.toList());
    }

    public FuelRecordResponse getById(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        return toResponse(record);
    }

    public FuelRecordResponse getFuelRecordWithRealTimeData(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        return toResponseWithRealTimeData(record);
    }

    public List<FuelRecordResponse> getByVehicle(UUID vehicleId) {
        return fuelRecordRepository.findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FuelRecordResponse> getByVehicleWithRealTimeData(UUID vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
        }

        return fuelRecordRepository.findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream()
                .map(this::toResponseWithRealTimeData)
                .collect(Collectors.toList());
    }

    public List<FuelRecordResponse> getByDriver(UUID driverId) {
        return fuelRecordRepository.findByDriverIdOrderByFuelDateDesc(driverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FuelRecordResponse> getFlaggedRecords() {
        return fuelRecordRepository.findAllFlaggedRecords()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<FuelRecordResponse> getByDateRange(String from, String to, UUID vehicleId, UUID driverId) {
        List<FuelRecord> records;
        if (vehicleId != null) {
            records = fuelRecordRepository.findByVehicleAndDateRange(vehicleId,
                    java.time.LocalDate.parse(from), java.time.LocalDate.parse(to));
        } else if (driverId != null) {
            records = fuelRecordRepository.findByDriverAndDateRange(driverId,
                    java.time.LocalDate.parse(from), java.time.LocalDate.parse(to));
        } else {
            records = fuelRecordRepository.findByDateRange(
                    java.time.LocalDate.parse(from), java.time.LocalDate.parse(to));
        }

        return records.stream()
                .map(this::toResponseWithEfficiency)
                .collect(Collectors.toList());
    }

    @Transactional
    public FuelRecordResponse updateFuelRecord(UUID id, CreateFuelRecordRequest request) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found in database: " + request.getVehicleId()));

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));
        }

        record.setVehicle(vehicle);
        record.setDriver(driver);
        record.setFuelDate(request.getFuelDate());
        record.setQuantity(request.getQuantity());
        record.setCostPerLitre(request.getCostPerLitre());
        record.setTotalCost(calculateTotalCost(request.getQuantity(), request.getCostPerLitre()));
        record.setOdometerReading(request.getOdometerReading());
        record.setFuelStation(request.getFuelStation());
        record.setNotes(request.getNotes());

        reEvaluateMisuse(record);

        FuelRecord saved = fuelRecordRepository.save(record);
        vehicle.setOdometerReading(request.getOdometerReading());
        vehicleRepository.save(vehicle);

        return toResponse(saved);
    }

    @Transactional
    public FuelRecordResponse patchFuelRecord(UUID id, PatchFuelRecordRequest updates) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));

        if (updates.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(updates.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found in database: " + updates.getVehicleId()));
            record.setVehicle(vehicle);
        }

        if (updates.getDriverId() != null) {
            Driver driver = driverRepository.findById(updates.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + updates.getDriverId()));
            record.setDriver(driver);
        }

        if (updates.getFuelDate() != null) {
            record.setFuelDate(updates.getFuelDate());
        }
        if (updates.getQuantity() != null) {
            record.setQuantity(updates.getQuantity());
        }
        if (updates.getCostPerLitre() != null) {
            record.setCostPerLitre(updates.getCostPerLitre());
        }
        if (updates.getOdometerReading() != null) {
            record.setOdometerReading(updates.getOdometerReading());
        }
        if (updates.getFuelStation() != null) {
            record.setFuelStation(updates.getFuelStation());
        }
        if (updates.getNotes() != null) {
            record.setNotes(updates.getNotes());
        }

        if (record.getQuantity() == null || record.getCostPerLitre() == null) {
            throw new ValidationException("Quantity and costPerLitre must be set to compute total cost.");
        }
        record.setTotalCost(calculateTotalCost(record.getQuantity(), record.getCostPerLitre()));

        reEvaluateMisuse(record);

        FuelRecord saved = fuelRecordRepository.save(record);
        if (updates.getOdometerReading() != null) {
            Vehicle vehicle = saved.getVehicle();
            vehicle.setOdometerReading(updates.getOdometerReading());
            vehicleRepository.save(vehicle);
        }

        return toResponse(saved);
    }

    @Transactional
    public FuelRecordResponse flagFuelRecord(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        record.setFlaggedForMisuse(true);
        if (record.getFlagReason() == null || record.getFlagReason().isBlank()) {
            record.setFlagReason(MANUAL_FLAG_REASON);
        }
        return toResponse(fuelRecordRepository.save(record));
    }

    @Transactional
    public FuelRecordResponse unflagFuelRecord(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        record.setFlaggedForMisuse(false);
        record.setFlagReason(null);
        return toResponse(fuelRecordRepository.save(record));
    }

    @Transactional
    public void deleteFuelRecord(UUID id) {
        if (!fuelRecordRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fuel record not found: " + id);
        }
        fuelRecordRepository.deleteById(id);
    }

    private BigDecimal calculateTotalCost(BigDecimal quantity, BigDecimal costPerLitre) {
        return quantity.multiply(costPerLitre).setScale(2, RoundingMode.HALF_UP);
    }

    public FuelFormMetadataResponse getFormMetadata() {
        List<FuelLookupOptionResponse> vehicles = vehicleRepository.findAll()
                .stream()
                .map(vehicle -> FuelLookupOptionResponse.builder()
                        .id(vehicle.getId())
                        .label(vehicle.getPlateNumber() + " - " + vehicle.getMake() + " " + vehicle.getModel())
                        .build())
                .sorted((left, right) -> left.getLabel().compareToIgnoreCase(right.getLabel()))
                .toList();

        List<FuelLookupOptionResponse> drivers = driverRepository.findAll()
                .stream()
                .map(driver -> FuelLookupOptionResponse.builder()
                        .id(driver.getId())
                        .label(driver.getFullName())
                        .build())
                .sorted((left, right) -> left.getLabel().compareToIgnoreCase(right.getLabel()))
                .toList();

        return FuelFormMetadataResponse.builder()
                .vehicles(vehicles)
                .drivers(drivers)
                .build();
    }

    private void reEvaluateMisuse(FuelRecord record) {
        record.setFlaggedForMisuse(false);
        record.setFlagReason(null);
        String reason = fuelMisuseService.checkForMisuse(record);
        if (reason != null) {
            record.setFlaggedForMisuse(true);
            record.setFlagReason(reason);
        }
    }

    FuelRecordResponse toResponse(FuelRecord record) {
        return FuelRecordResponse.builder()
                .id(record.getId())
                .vehicleId(record.getVehicle().getId())
                .vehiclePlate(record.getVehicle().getPlateNumber())
                .vehicleMakeModel(record.getVehicle().getMake() + " " + record.getVehicle().getModel())
                .driverId(record.getDriver() != null ? record.getDriver().getId() : null)
                .driverName(record.getDriver() != null ? record.getDriver().getFullName() : null)
                .fuelDate(record.getFuelDate())
                .quantity(record.getQuantity())
                .costPerLitre(record.getCostPerLitre())
                .totalCost(record.getTotalCost())
                .odometerReading(record.getOdometerReading())
                .fuelStation(record.getFuelStation())
                .notes(record.getNotes())
                .receiptUrl(record.getReceiptUrl())
                .receiptFileName(record.getReceiptFileName())
                .flaggedForMisuse(record.isFlaggedForMisuse())
                .flagReason(record.getFlagReason())
                .createdBy(record.getCreatedBy())
                .createdAt(record.getCreatedAt())
                .build();
    }

    public FuelRecordResponse toResponseWithRealTimeData(FuelRecord record) {
        try {
            VehicleDetailDto vehicleDetail = vehicleApiClient.getVehicleById(record.getVehicle().getId());
            return FuelRecordResponse.builder()
                    .id(record.getId())
                    .vehicleId(record.getVehicle().getId())
                    .vehiclePlate(vehicleDetail.getPlateNumber())
                    .vehicleMakeModel(vehicleDetail.getMake() + " " + vehicleDetail.getModel())
                    .driverId(record.getDriver() != null ? record.getDriver().getId() : null)
                    .driverName(record.getDriver() != null ? record.getDriver().getFullName() : null)
                    .fuelDate(record.getFuelDate())
                    .quantity(record.getQuantity())
                    .costPerLitre(record.getCostPerLitre())
                    .totalCost(record.getTotalCost())
                    .odometerReading(record.getOdometerReading())
                    .fuelStation(record.getFuelStation())
                    .notes(record.getNotes())
                    .receiptUrl(record.getReceiptUrl())
                    .receiptFileName(record.getReceiptFileName())
                    .flaggedForMisuse(record.isFlaggedForMisuse())
                    .flagReason(record.getFlagReason())
                    .createdBy(record.getCreatedBy())
                    .createdAt(record.getCreatedAt())
                    .build();
        } catch (Exception e) {
            log.warn("Failed to fetch real-time vehicle data, using cached: {}", e.getMessage());
            return toResponse(record);
        }
    }

    private FuelRecordResponse toResponseWithEfficiency(FuelRecord record) {
        FuelRecordResponse response = toResponse(record);
        List<FuelRecord> vehicleRecords = fuelRecordRepository.findLatestByVehicle(record.getVehicle().getId());

        for (int index = 0; index < vehicleRecords.size(); index++) {
            if (vehicleRecords.get(index).getId().equals(record.getId()) && index + 1 < vehicleRecords.size()) {
                FuelRecord previous = vehicleRecords.get(index + 1);
                double distance = record.getOdometerReading() - previous.getOdometerReading();
                if (distance > 0) {
                    double efficiency = distance / record.getQuantity().doubleValue();
                    response.setEfficiencyKmPerLitre(Math.round(efficiency * 100.0) / 100.0);
                    response.setDistanceSinceLast(distance);
                }
                break;
            }
        }

        return response;
    }
}
