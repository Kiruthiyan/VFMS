package com.vfms.fuel.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.enums.DriverStatus;
import com.vfms.common.enums.VehicleStatus;
import com.vfms.driver.entity.Driver;
import com.vfms.driver.repository.DriverRepository;
import com.vfms.fuel.client.VehicleApiClient;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import com.vfms.fuel.dto.FuelMetadataVehicleProjection;
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
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
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
        Long vehicleId = parseVehicleId(request.getVehicleId());
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found: " + request.getVehicleId()));
        validateVehicleEligibility(vehicle);

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));
            validateDriverEligibility(driver);
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

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getAllRecords() {
        return fuelRecordRepository.findAllByOrderByFuelDateDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getAllRecordsWithRealTimeData() {
        return fuelRecordRepository.findAllByOrderByFuelDateDesc()
                .stream()
                .map(this::toResponseWithRealTimeData)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FuelRecordResponse getById(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public FuelRecordResponse getFuelRecordWithRealTimeData(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        return toResponseWithRealTimeData(record);
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getByVehicle(Long vehicleId) {
        return fuelRecordRepository.findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getByVehicleWithRealTimeData(Long vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            throw new ResourceNotFoundException("Vehicle not found: " + vehicleId);
        }

        return fuelRecordRepository.findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream()
                .map(this::toResponseWithRealTimeData)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getByDriver(UUID driverId) {
        return fuelRecordRepository.findByDriverIdOrderByFuelDateDesc(driverId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getFlaggedRecords() {
        return fuelRecordRepository.findAllFlaggedRecords()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getByDateRange(String from, String to, Long vehicleId, UUID driverId) {
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

        Long vehicleId = parseVehicleId(request.getVehicleId());
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found in database: " + request.getVehicleId()));
        validateVehicleEligibility(vehicle);

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + request.getDriverId()));
            validateDriverEligibility(driver);
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
            Long vehicleId = parseVehicleId(updates.getVehicleId());
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Vehicle not found in database: " + updates.getVehicleId()));
            validateVehicleEligibility(vehicle);
            record.setVehicle(vehicle);
        }

        if (updates.getDriverId() != null) {
            Driver driver = driverRepository.findById(updates.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + updates.getDriverId()));
            validateDriverEligibility(driver);
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

    @Transactional(readOnly = true)
    public FuelFormMetadataResponse getFormMetadata() {
        List<FuelLookupOptionResponse> vehicles = vehicleRepository.findFuelMetadataVehicles()
                .stream()
                .map(vehicle -> FuelLookupOptionResponse.builder()
                        .id(String.valueOf(vehicle.getId()))
                        .label(buildVehicleLookupLabel(vehicle))
                        .build())
                .sorted(Comparator.comparing(
                        FuelLookupOptionResponse::getLabel,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                ))
                .toList();

        List<FuelLookupOptionResponse> drivers = driverRepository.findFuelMetadataDrivers()
                .stream()
                .map(driver -> FuelLookupOptionResponse.builder()
                        .id(String.valueOf(driver.getId()))
                        .label(buildDriverLookupLabel(driver))
                        .build())
                .sorted(Comparator.comparing(
                        FuelLookupOptionResponse::getLabel,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
                ))
                .toList();

        return FuelFormMetadataResponse.builder()
                .vehicles(vehicles)
                .drivers(drivers)
                .build();
    }

    private String buildVehicleLookupLabel(FuelMetadataVehicleProjection vehicle) {
        String plateNumber = safeValue(vehicle.getPlateNumber());
        String make = safeValue(vehicle.getMake());
        String model = safeValue(vehicle.getModel());
        String vehicleName = joinNonBlank(make, model);

        if (!plateNumber.isBlank() && !vehicleName.isBlank()) {
            return plateNumber + " - " + vehicleName;
        }

        if (!plateNumber.isBlank()) {
            return plateNumber;
        }

        if (!vehicleName.isBlank()) {
            return vehicleName;
        }

        return "Vehicle " + vehicle.getId();
    }

    private String buildDriverLookupLabel(FuelMetadataDriverProjection driver) {
        String fullName = safeValue(driver.getFullName());
        return fullName.isBlank() ? "Driver " + driver.getId() : fullName;
    }

    private String safeValue(String value) {
        return value == null ? "" : value.trim();
    }

    private String joinNonBlank(String... values) {
        return java.util.Arrays.stream(values)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.joining(" "));
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

    private void validateVehicleEligibility(Vehicle vehicle) {
        if (Boolean.FALSE.equals(vehicle.getActive())) {
            throw new ValidationException("Only active vehicles can be used for fuel entries.");
        }

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new ValidationException("Only available vehicles can be used for fuel entries.");
        }
    }

    private void validateDriverEligibility(Driver driver) {
        DriverStatus status = driver.getStatus();
        if (status != DriverStatus.ACTIVE && status != DriverStatus.AVAILABLE) {
            throw new ValidationException("Only active drivers can be assigned to fuel entries.");
        }
    }

    FuelRecordResponse toResponse(FuelRecord record) {
        return FuelRecordResponse.builder()
                .id(record.getId())
                .vehicleId(String.valueOf(record.getVehicle().getId()))
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
                    .vehicleId(String.valueOf(record.getVehicle().getId()))
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

    private Long parseVehicleId(String rawVehicleId) {
        if (rawVehicleId == null || rawVehicleId.trim().isEmpty()) {
            throw new ValidationException("Vehicle ID is required.");
        }

        try {
            return Long.valueOf(rawVehicleId.trim());
        } catch (NumberFormatException ex) {
            throw new ValidationException("Vehicle ID must be a valid numeric identifier.");
        }
    }
}
