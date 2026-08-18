package com.vfms.fuel.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.vehicle.VehicleStatus;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import com.vfms.fuel.dto.FuelMetadataVehicleProjection;
import com.vfms.fuel.dto.FuelFormMetadataResponse;
import com.vfms.fuel.dto.FuelLookupOptionResponse;
import com.vfms.fuel.dto.FuelRecordResponse;
import com.vfms.fuel.dto.PatchFuelRecordRequest;
import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Handles fuel record persistence, lookup metadata, and misuse re-evaluation
 * for the fuel management module.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FuelService {

    private static final String MANUAL_FLAG_REASON = "Manually flagged by admin";

    private final FuelRecordRepository fuelRecordRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
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
        validateFuelDateNotFuture(request.getFuelDate());
        validateOdometerSequence(vehicle.getId(), null,
                request.getFuelDate(), request.getOdometerReading());

        User driver = null;
        if (request.getDriverId() != null) {
            driver = userRepository.findById(request.getDriverId())
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
        syncVehicleOdometer(vehicle, request.getOdometerReading());

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
    public FuelRecordResponse getById(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public String createReceiptAccessUrl(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        if (record.getReceiptUrl() == null || record.getReceiptUrl().isBlank()) {
            throw new ResourceNotFoundException("Fuel receipt not found for record: " + id);
        }
        return fuelStorageService.createSignedReceiptUrl(record.getReceiptUrl());
    }

    @Transactional(readOnly = true)
    public List<FuelRecordResponse> getByVehicle(Long vehicleId) {
        return fuelRecordRepository.findByVehicleIdOrderByFuelDateDesc(vehicleId)
                .stream()
                .map(this::toResponse)
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
        LocalDate fromDate = parseFuelSearchDate(from, "from");
        LocalDate toDate = parseFuelSearchDate(to, "to");
        if (fromDate.isAfter(toDate)) {
            throw new ValidationException(
                    "Invalid date range.",
                    Map.of("from", "Start date must not be after end date.")
            );
        }

        List<FuelRecord> records;
        if (vehicleId != null) {
            records = fuelRecordRepository.findByVehicleAndDateRange(vehicleId, fromDate, toDate);
        } else if (driverId != null) {
            records = fuelRecordRepository.findByDriverAndDateRange(driverId, fromDate, toDate);
        } else {
            records = fuelRecordRepository.findByDateRange(fromDate, toDate);
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
        validateFuelDateNotFuture(request.getFuelDate());
        validateOdometerSequence(vehicle.getId(), record.getId(),
                request.getFuelDate(), request.getOdometerReading());

        User driver = null;
        if (request.getDriverId() != null) {
            driver = userRepository.findById(request.getDriverId())
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
        syncVehicleOdometer(vehicle, request.getOdometerReading());

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
            User driver = userRepository.findById(updates.getDriverId())
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
        validateFuelDateNotFuture(record.getFuelDate());
        validateOdometerSequence(record.getVehicle().getId(), record.getId(),
                record.getFuelDate(), record.getOdometerReading());
        record.setTotalCost(calculateTotalCost(record.getQuantity(), record.getCostPerLitre()));

        reEvaluateMisuse(record);

        FuelRecord saved = fuelRecordRepository.save(record);
        if (updates.getOdometerReading() != null) {
            syncVehicleOdometer(saved.getVehicle(), updates.getOdometerReading());
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

    @Transactional
    public FuelRecordResponse removeReceipt(UUID id) {
        FuelRecord record = fuelRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel record not found: " + id));
        record.setReceiptUrl(null);
        record.setReceiptFileName(null);
        return toResponse(fuelRecordRepository.save(record));
    }

    /**
     * Recalculates total cost on every create/update path so the persisted amount
     * always matches the submitted quantity and price per litre.
     */
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

        List<FuelLookupOptionResponse> drivers = userRepository.findFuelMetadataDrivers()
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

    /**
     * Re-runs misuse checks after every create or update so manual edits cannot
     * leave the flag state out of sync with the current fuel record values.
     */
    private void reEvaluateMisuse(FuelRecord record) {
        if (MANUAL_FLAG_REASON.equals(record.getFlagReason())) {
            return;
        }

        record.setFlaggedForMisuse(false);
        record.setFlagReason(null);
        String reason = fuelMisuseService.checkForMisuse(record, record.getId());
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

    private void validateDriverEligibility(User driver) {
        if (driver.getRole() != Role.DRIVER) {
            throw new ValidationException("Only users with the DRIVER role can be assigned to fuel entries.");
        }
        UserStatus status = driver.getStatus();
        if (status != UserStatus.APPROVED) {
            throw new ValidationException("Only active drivers can be assigned to fuel entries.");
        }
    }

    private void validateFuelDateNotFuture(LocalDate fuelDate) {
        if (fuelDate != null && fuelDate.isAfter(LocalDate.now())) {
            throw new ValidationException("Fuel date cannot be in the future.");
        }
    }

    private void validateOdometerSequence(
            Long vehicleId,
            UUID currentRecordId,
            LocalDate fuelDate,
            Double odometerReading
    ) {
        if (vehicleId == null || fuelDate == null || odometerReading == null) {
            return;
        }

        List<FuelRecord> vehicleRecords = currentRecordId == null
                ? fuelRecordRepository.findLatestByVehicle(vehicleId)
                : fuelRecordRepository.findLatestByVehicleExcluding(vehicleId, currentRecordId);
        if (vehicleRecords == null) {
            return;
        }

        for (FuelRecord existing : vehicleRecords) {
            if (existing.getFuelDate() == null || existing.getOdometerReading() == null) {
                continue;
            }

            boolean previousOrSameNewEntry = existing.getFuelDate().isBefore(fuelDate)
                    || (currentRecordId == null && existing.getFuelDate().isEqual(fuelDate));
            if (previousOrSameNewEntry && existing.getOdometerReading() > odometerReading) {
                throw new ValidationException(
                        "Odometer reading cannot be lower than the latest recorded reading for this vehicle."
                );
            }

            if (existing.getFuelDate().isAfter(fuelDate)
                    && existing.getOdometerReading() < odometerReading) {
                throw new ValidationException(
                        "Odometer reading cannot be greater than a later fuel record for this vehicle."
                );
            }
        }
    }

    private void syncVehicleOdometer(Vehicle vehicle, Double odometerReading) {
        if (vehicle == null || odometerReading == null) {
            return;
        }

        Double currentOdometer = vehicle.getOdometerReading();
        if (currentOdometer == null || odometerReading > currentOdometer) {
            vehicle.setOdometerReading(odometerReading);
            vehicleRepository.save(vehicle);
        }
    }

    private record DriverFields(UUID id, String name) {}

    private DriverFields resolveDriverFields(FuelRecord record) {
        User driver = record.getDriver();
        if (driver == null) {
            return new DriverFields(null, null);
        }
        return new DriverFields(driver.getId(), driver.getFullName());
    }

    FuelRecordResponse toResponse(FuelRecord record) {
        DriverFields driverFields = resolveDriverFields(record);
        Vehicle vehicle = record.getVehicle();
        String vehicleId = vehicle != null ? String.valueOf(vehicle.getId()) : null;
        String vehiclePlate = vehicle != null ? vehicle.getPlateNumber() : null;
        String vehicleMakeModel = vehicle != null
                ? vehicle.getBrand() + " " + vehicle.getModel()
                : null;

        return FuelRecordResponse.builder()
                .id(record.getId())
                .vehicleId(vehicleId)
                .vehiclePlate(vehiclePlate)
                .vehicleMakeModel(vehicleMakeModel)
                .driverId(driverFields.id())
                .driverName(driverFields.name())
                .fuelDate(record.getFuelDate())
                .quantity(record.getQuantity())
                .costPerLitre(record.getCostPerLitre())
                .totalCost(record.getTotalCost())
                .odometerReading(record.getOdometerReading())
                .fuelStation(record.getFuelStation())
                .notes(record.getNotes())
                .receiptUrl(protectedReceiptUrl(record))
                .receiptFileName(record.getReceiptFileName())
                .flaggedForMisuse(record.isFlaggedForMisuse())
                .flagReason(record.getFlagReason())
                .createdBy(record.getCreatedBy())
                .createdAt(record.getCreatedAt())
                .build();
    }

    private FuelRecordResponse toResponseWithEfficiency(FuelRecord record) {
        FuelRecordResponse response = toResponse(record);
        Vehicle vehicle = record.getVehicle();
        if (vehicle == null) {
            return response;
        }

        List<FuelRecord> vehicleRecords = fuelRecordRepository.findLatestByVehicle(vehicle.getId());

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

    private LocalDate parseFuelSearchDate(String value, String param) {
        if (value == null || value.isBlank()) {
            throw new ValidationException(
                    "Invalid date range.",
                    Map.of(param, "Date is required.")
            );
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (DateTimeParseException ex) {
            throw new ValidationException(
                    "Invalid date range.",
                    Map.of(param, "Use ISO date format (yyyy-MM-dd).")
            );
        }
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

    private String protectedReceiptUrl(FuelRecord record) {
        if (record.getId() == null
                || record.getReceiptUrl() == null
                || record.getReceiptUrl().isBlank()) {
            return null;
        }
        return "/api/v1/fuel/" + record.getId() + "/receipt";
    }
}
