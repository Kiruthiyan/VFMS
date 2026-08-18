package com.vfms.fuel.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import com.vfms.fuel.dto.FuelMetadataVehicleProjection;
import com.vfms.fuel.dto.PatchFuelRecordRequest;
import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.user.entity.User;
import com.vfms.user.repository.UserRepository;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import com.vfms.vehicle.VehicleStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FuelService Unit Tests")
class FuelServiceTest {

    @Mock private FuelRecordRepository fuelRecordRepository;
    @Mock private VehicleRepository vehicleRepository;
    @Mock private UserRepository userRepository;
    @Mock private FuelStorageService fuelStorageService;
    @Mock private FuelMisuseService fuelMisuseService;

    @InjectMocks
    private FuelService fuelService;

    @Mock
    private UserDetails userDetails;

    @Test
    @DisplayName("createFuelRecord should throw 404 when vehicle does not exist in repository")
    void createFuelRecord_shouldThrowWhenVehicleIsMissing() {
        CreateFuelRecordRequest req = baseCreateRequest();
        when(vehicleRepository.findById(Long.valueOf(req.getVehicleId()))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> fuelService.createFuelRecord(req, null, userDetails));
        verify(fuelRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("createFuelRecord should save record, upload receipt, update vehicle odometer")
    void createFuelRecord_shouldSaveAndUpdateOdometer() {
        CreateFuelRecordRequest req = baseCreateRequest();

        Vehicle vehicle = Vehicle.builder()
                .id(Long.valueOf(req.getVehicleId()))
                .plateNumber("ABC-1234")
                .brand("Toyota")
                .model("Camry")
                .odometerReading(900.0)
                .build();
        User driver = testDriver(req.getDriverId(), "Test Driver");

        when(userDetails.getUsername()).thenReturn("admin@vfms.com");
        when(vehicleRepository.findById(Long.valueOf(req.getVehicleId()))).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(req.getDriverId())).thenReturn(Optional.of(driver));
        when(fuelMisuseService.checkForMisuse(any(), any())).thenReturn(null);
        when(fuelRecordRepository.save(any())).thenAnswer(inv -> {
            FuelRecord r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        MultipartFile receipt = mock(MultipartFile.class);
        when(receipt.isEmpty()).thenReturn(false);
        when(fuelStorageService.uploadReceipt(receipt)).thenReturn("https://example/receipt");
        when(receipt.getOriginalFilename()).thenReturn("r.png");

        var resp = fuelService.createFuelRecord(req, receipt, userDetails);

        assertNotNull(resp.getId());
        assertEquals(req.getVehicleId(), resp.getVehicleId());
        assertEquals("/api/v1/fuel/" + resp.getId() + "/receipt", resp.getReceiptUrl());
        verify(vehicleRepository).save(argThat(v -> v.getOdometerReading().equals(req.getOdometerReading())));
    }

    @Test
    @DisplayName("createFuelRecord should reject future fuel dates")
    void createFuelRecord_shouldRejectFutureFuelDates() {
        CreateFuelRecordRequest req = baseCreateRequest();
        req.setFuelDate(LocalDate.now().plusDays(1));

        Vehicle vehicle = Vehicle.builder()
                .id(Long.valueOf(req.getVehicleId()))
                .plateNumber("ABC-1234")
                .brand("Toyota")
                .model("Camry")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();

        when(vehicleRepository.findById(Long.valueOf(req.getVehicleId()))).thenReturn(Optional.of(vehicle));

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> fuelService.createFuelRecord(req, null, userDetails)
        );

        assertEquals("Fuel date cannot be in the future.", exception.getMessage());
        verify(fuelRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("createFuelRecord should reject odometer readings below latest vehicle fuel record")
    void createFuelRecord_shouldRejectLowerOdometerThanLatestRecord() {
        CreateFuelRecordRequest req = baseCreateRequest();
        req.setOdometerReading(950.0);

        Long vehicleId = Long.valueOf(req.getVehicleId());
        Vehicle vehicle = Vehicle.builder()
                .id(vehicleId)
                .plateNumber("ABC-1234")
                .brand("Toyota")
                .model("Camry")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();
        FuelRecord latest = FuelRecord.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .fuelDate(req.getFuelDate())
                .odometerReading(1000.0)
                .build();

        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(fuelRecordRepository.findLatestByVehicle(vehicleId)).thenReturn(List.of(latest));

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> fuelService.createFuelRecord(req, null, userDetails)
        );

        assertEquals(
                "Odometer reading cannot be lower than the latest recorded reading for this vehicle.",
                exception.getMessage()
        );
        verify(fuelRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("patchFuelRecord should require quantity and costPerLitre before computing total")
    void patchFuelRecord_shouldRequireQuantityAndCost() {
        UUID id = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(101L).plateNumber("A").brand("M").model("X").build())
                .fuelDate(LocalDate.now())
                .quantity(null)
                .costPerLitre(null)
                .odometerReading(10.0)
                .build();

        when(fuelRecordRepository.findById(id)).thenReturn(Optional.of(record));

        PatchFuelRecordRequest patch = new PatchFuelRecordRequest();
        patch.setNotes("x");

        assertThrows(ValidationException.class, () -> fuelService.patchFuelRecord(id, patch));
    }

    @Test
    @DisplayName("flag/unflag should update misuse flags")
    void flagUnflag_shouldWork() {
        UUID id = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(202L).plateNumber("A").brand("M").model("X").build())
                .fuelDate(LocalDate.now())
                .quantity(BigDecimal.TEN)
                .costPerLitre(BigDecimal.TEN)
                .totalCost(BigDecimal.TEN)
                .odometerReading(10.0)
                .build();

        when(fuelRecordRepository.findById(id)).thenReturn(Optional.of(record));
        when(fuelRecordRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var flagged = fuelService.flagFuelRecord(id);
        assertTrue(flagged.isFlaggedForMisuse());

        var unflagged = fuelService.unflagFuelRecord(id);
        assertFalse(unflagged.isFlaggedForMisuse());
        assertNull(unflagged.getFlagReason());
    }

    @Test
    @DisplayName("toResponse should tolerate missing related vehicle and driver")
    void toResponse_shouldTolerateMissingRelations() {
        FuelRecord record = FuelRecord.builder()
                .id(UUID.randomUUID())
                .vehicle(null)
                .driver(null)
                .fuelDate(LocalDate.now())
                .quantity(BigDecimal.TEN)
                .costPerLitre(BigDecimal.TEN)
                .totalCost(BigDecimal.TEN)
                .odometerReading(10.0)
                .build();

        var response = fuelService.toResponse(record);

        assertEquals(record.getId(), response.getId());
        assertNull(response.getVehicleId());
        assertNull(response.getVehiclePlate());
        assertNull(response.getVehicleMakeModel());
        assertNull(response.getDriverId());
        assertNull(response.getDriverName());
    }

    @Test
    @DisplayName("deleteFuelRecord should throw 404 when record missing")
    void deleteFuelRecord_shouldThrowWhenMissing() {
        UUID id = UUID.randomUUID();
        when(fuelRecordRepository.existsById(id)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> fuelService.deleteFuelRecord(id));
    }

    @Test
    @DisplayName("createReceiptAccessUrl should sign the stored receipt reference")
    void createReceiptAccessUrl_shouldSignStoredReceiptReference() {
        UUID id = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(202L).plateNumber("A").brand("M").model("X").build())
                .fuelDate(LocalDate.now())
                .quantity(BigDecimal.TEN)
                .costPerLitre(BigDecimal.TEN)
                .totalCost(BigDecimal.TEN)
                .odometerReading(10.0)
                .receiptUrl("receipts/r.pdf")
                .build();

        when(fuelRecordRepository.findById(id)).thenReturn(Optional.of(record));
        when(fuelStorageService.createSignedReceiptUrl("receipts/r.pdf"))
                .thenReturn("https://signed.example/r.pdf");

        assertEquals("https://signed.example/r.pdf", fuelService.createReceiptAccessUrl(id));
    }

    @Test
    @DisplayName("updateFuelRecord should update driver when provided")
    void updateFuelRecord_shouldUpdateDriver() {
        UUID id = UUID.randomUUID();
        CreateFuelRecordRequest req = baseCreateRequest();
        Long vehicleId = Long.valueOf(req.getVehicleId());

        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(vehicleId).plateNumber("A").brand("M").model("X").build())
                .fuelDate(LocalDate.now())
                .quantity(BigDecimal.ONE)
                .costPerLitre(BigDecimal.ONE)
                .totalCost(BigDecimal.ONE)
                .odometerReading(10.0)
                .createdBy("admin@vfms.com")
                .build();

        Vehicle vehicle = Vehicle.builder()
                .id(vehicleId)
                .plateNumber("A")
                .brand("M")
                .model("X")
                .build();

        User driver = testDriver(req.getDriverId(), "D");

        when(fuelRecordRepository.findById(id)).thenReturn(Optional.of(record));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(req.getDriverId())).thenReturn(Optional.of(driver));
        when(fuelMisuseService.checkForMisuse(any(), any())).thenReturn(null);
        when(fuelRecordRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var resp = fuelService.updateFuelRecord(id, req);
        assertEquals(req.getDriverId(), resp.getDriverId());
    }

    @Test
    @DisplayName("createFuelRecord should reject non-numeric vehicle IDs")
    void createFuelRecord_shouldRejectNonNumericVehicleId() {
        CreateFuelRecordRequest req = baseCreateRequest();
        req.setVehicleId("vehicle-abc");

        ValidationException exception = assertThrows(
                ValidationException.class,
                () -> fuelService.createFuelRecord(req, null, userDetails)
        );

        assertEquals("Vehicle ID must be a valid numeric identifier.", exception.getMessage());
        verify(vehicleRepository, never()).findById(anyLong());
    }

    @Test
    @DisplayName("getFormMetadata should tolerate incomplete labels without throwing")
    void getFormMetadata_shouldTolerateIncompleteLabels() {
        Long firstVehicleId = 1L;
        Long secondVehicleId = 2L;
        UUID firstDriverId = UUID.randomUUID();
        UUID secondDriverId = UUID.randomUUID();

        FuelMetadataVehicleProjection vehicleWithMissingNames = fuelMetadataVehicle(
                firstVehicleId,
                "CAB-1234",
                null,
                ""
        );
        FuelMetadataVehicleProjection vehicleWithNoDisplayFields = fuelMetadataVehicle(
                secondVehicleId,
                "",
                null,
                null
        );

        FuelMetadataDriverProjection namedDriver = fuelMetadataDriver(firstDriverId, "Zara Driver");
        FuelMetadataDriverProjection unnamedDriver = fuelMetadataDriver(secondDriverId, " ");

        when(vehicleRepository.findFuelMetadataVehicles())
                .thenReturn(List.of(vehicleWithNoDisplayFields, vehicleWithMissingNames));
        when(userRepository.findFuelMetadataDrivers())
                .thenReturn(List.of(unnamedDriver, namedDriver));

        var metadata = fuelService.getFormMetadata();

        assertEquals(2, metadata.getVehicles().size());
        assertEquals(String.valueOf(firstVehicleId), metadata.getVehicles().get(0).getId());
        assertEquals("CAB-1234", metadata.getVehicles().get(0).getLabel());
        assertEquals("Vehicle " + secondVehicleId, metadata.getVehicles().get(1).getLabel());

        assertEquals(2, metadata.getDrivers().size());
        assertEquals(String.valueOf(secondDriverId), metadata.getDrivers().get(0).getId());
        assertEquals("Driver " + secondDriverId, metadata.getDrivers().get(0).getLabel());
        assertEquals("Zara Driver", metadata.getDrivers().get(1).getLabel());
    }

    @Test
    @DisplayName("getAllRecords should map fuel records ordered by fuel date")
    void getAllRecords_shouldReturnMappedRecords() {
        UUID recordId = UUID.randomUUID();
        UUID driverId = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(recordId)
                .vehicle(Vehicle.builder().id(101L).plateNumber("ABC-1234").brand("Toyota").model("Camry").build())
                .driver(testDriver(driverId, "Test Driver"))
                .fuelDate(LocalDate.of(2026, 6, 10))
                .quantity(new BigDecimal("40.00"))
                .costPerLitre(new BigDecimal("350.00"))
                .totalCost(new BigDecimal("14000.00"))
                .odometerReading(1500.0)
                .createdBy("admin@vfms.com")
                .build();

        when(fuelRecordRepository.findAllByOrderByFuelDateDesc()).thenReturn(List.of(record));

        var records = fuelService.getAllRecords();

        assertEquals(1, records.size());
        assertEquals(recordId, records.get(0).getId());
        assertEquals(driverId, records.get(0).getDriverId());
        assertEquals("Test Driver", records.get(0).getDriverName());
        assertEquals("101", records.get(0).getVehicleId());
    }

    @Test
    @DisplayName("getAllRecords should tolerate records without a driver")
    void getAllRecords_shouldTolerateMissingDriver() {
        FuelRecord record = FuelRecord.builder()
                .id(UUID.randomUUID())
                .vehicle(Vehicle.builder().id(202L).plateNumber("XYZ-9999").brand("Honda").model("Civic").build())
                .driver(null)
                .fuelDate(LocalDate.of(2026, 6, 11))
                .quantity(new BigDecimal("20.00"))
                .costPerLitre(new BigDecimal("300.00"))
                .totalCost(new BigDecimal("6000.00"))
                .odometerReading(2200.0)
                .createdBy("admin@vfms.com")
                .build();

        when(fuelRecordRepository.findAllByOrderByFuelDateDesc()).thenReturn(List.of(record));

        var records = fuelService.getAllRecords();

        assertEquals(1, records.size());
        assertNull(records.get(0).getDriverId());
        assertNull(records.get(0).getDriverName());
    }

    @Test
    @DisplayName("getFlaggedRecords should return only flagged records")
    void getFlaggedRecords_shouldReturnFlaggedRecords() {
        UUID recordId = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(recordId)
                .vehicle(Vehicle.builder().id(303L).plateNumber("FLG-1111").brand("Ford").model("Ranger").build())
                .fuelDate(LocalDate.of(2026, 6, 12))
                .quantity(new BigDecimal("80.00"))
                .costPerLitre(new BigDecimal("320.00"))
                .totalCost(new BigDecimal("25600.00"))
                .odometerReading(5000.0)
                .flaggedForMisuse(true)
                .flagReason("Excessive volume")
                .createdBy("admin@vfms.com")
                .build();

        when(fuelRecordRepository.findAllFlaggedRecords()).thenReturn(List.of(record));

        var records = fuelService.getFlaggedRecords();

        assertEquals(1, records.size());
        assertEquals(recordId, records.get(0).getId());
        assertTrue(records.get(0).isFlaggedForMisuse());
        assertEquals("Excessive volume", records.get(0).getFlagReason());
    }

    @Test
    @DisplayName("getByDateRange should reject invalid date format")
    void getByDateRange_shouldRejectInvalidDateFormat() {
        ValidationException ex = assertThrows(ValidationException.class,
                () -> fuelService.getByDateRange("not-a-date", "2024-01-31", null, null));
        assertTrue(ex.getErrors().containsKey("from"));
        verify(fuelRecordRepository, never()).findByDateRange(any(), any());
    }

    @Test
    @DisplayName("createFuelRecord should throw 404 when driver does not exist")
    void createFuelRecord_shouldThrowWhenDriverIsMissing() {
        CreateFuelRecordRequest req = baseCreateRequest();
        Vehicle vehicle = Vehicle.builder()
                .id(Long.valueOf(req.getVehicleId()))
                .plateNumber("ABC-1234")
                .brand("Toyota")
                .model("Camry")
                .build();

        when(vehicleRepository.findById(Long.valueOf(req.getVehicleId()))).thenReturn(Optional.of(vehicle));
        when(userRepository.findById(req.getDriverId())).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> fuelService.createFuelRecord(req, null, userDetails));
        verify(fuelRecordRepository, never()).save(any());
    }

    @Test
    @DisplayName("getByDateRange should reject when start date is after end date")
    void getByDateRange_shouldRejectInvertedRange() {
        ValidationException ex = assertThrows(ValidationException.class,
                () -> fuelService.getByDateRange("2024-02-01", "2024-01-01", null, null));
        assertTrue(ex.getErrors().containsKey("from"));
        verify(fuelRecordRepository, never()).findByDateRange(any(), any());
    }

    private CreateFuelRecordRequest baseCreateRequest() {
        CreateFuelRecordRequest req = new CreateFuelRecordRequest();
        req.setVehicleId("101");
        req.setDriverId(UUID.randomUUID());
        req.setFuelDate(LocalDate.now());
        req.setQuantity(new BigDecimal("10.00"));
        req.setCostPerLitre(new BigDecimal("20.00"));
        req.setOdometerReading(1000.0);
        req.setFuelStation("Station");
        req.setNotes("Notes");
        return req;
    }

    private User testDriver(UUID id, String fullName) {
        return User.builder()
                .id(id)
                .fullName(fullName)
                .email(id + "@drivers.test")
                .password("password")
                .phone("0712345678")
                .nic("123456789")
                .role(Role.DRIVER)
                .status(UserStatus.APPROVED)
                .build();
    }

    private FuelMetadataVehicleProjection fuelMetadataVehicle(
            Long id,
            String plateNumber,
            String make,
            String model
    ) {
        return new FuelMetadataVehicleProjection() {
            @Override
            public Long getId() {
                return id;
            }

            @Override
            public String getPlateNumber() {
                return plateNumber;
            }

            @Override
            public String getMake() {
                return make;
            }

            @Override
            public String getModel() {
                return model;
            }
        };
    }

    private FuelMetadataDriverProjection fuelMetadataDriver(UUID id, String fullName) {
        return new FuelMetadataDriverProjection() {
            @Override
            public UUID getId() {
                return id;
            }

            @Override
            public String getFullName() {
                return fullName;
            }
        };
    }
}

