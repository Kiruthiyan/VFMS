package com.vfms.fuel.service;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import com.vfms.driver.entity.Driver;
import com.vfms.driver.repository.DriverRepository;
import com.vfms.fuel.client.VehicleApiClient;
import com.vfms.fuel.dto.CreateFuelRecordRequest;
import com.vfms.fuel.dto.FuelMetadataDriverProjection;
import com.vfms.fuel.dto.FuelMetadataVehicleProjection;
import com.vfms.fuel.dto.PatchFuelRecordRequest;
import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.vehicle.entity.Vehicle;
import com.vfms.vehicle.repository.VehicleRepository;
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
    @Mock private DriverRepository driverRepository;
    @Mock private VehicleApiClient vehicleApiClient;
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
                .make("Toyota")
                .model("Camry")
                .odometerReading(900.0)
                .build();
        Driver driver = Driver.builder().id(req.getDriverId()).fullName("Test Driver").build();

        when(userDetails.getUsername()).thenReturn("admin@vfms.com");
        when(vehicleRepository.findById(Long.valueOf(req.getVehicleId()))).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById(req.getDriverId())).thenReturn(Optional.of(driver));
        when(fuelMisuseService.checkForMisuse(any())).thenReturn(null);
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
        verify(vehicleRepository).save(argThat(v -> v.getOdometerReading().equals(req.getOdometerReading())));
    }

    @Test
    @DisplayName("patchFuelRecord should require quantity and costPerLitre before computing total")
    void patchFuelRecord_shouldRequireQuantityAndCost() {
        UUID id = UUID.randomUUID();
        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(101L).plateNumber("A").make("M").model("X").build())
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
                .vehicle(Vehicle.builder().id(202L).plateNumber("A").make("M").model("X").build())
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
    @DisplayName("deleteFuelRecord should throw 404 when record missing")
    void deleteFuelRecord_shouldThrowWhenMissing() {
        UUID id = UUID.randomUUID();
        when(fuelRecordRepository.existsById(id)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class, () -> fuelService.deleteFuelRecord(id));
    }

    @Test
    @DisplayName("updateFuelRecord should update driver when provided")
    void updateFuelRecord_shouldUpdateDriver() {
        UUID id = UUID.randomUUID();
        CreateFuelRecordRequest req = baseCreateRequest();
        Long vehicleId = Long.valueOf(req.getVehicleId());

        FuelRecord record = FuelRecord.builder()
                .id(id)
                .vehicle(Vehicle.builder().id(vehicleId).plateNumber("A").make("M").model("X").build())
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
                .make("M")
                .model("X")
                .build();

        Driver driver = Driver.builder().id(req.getDriverId()).fullName("D").build();

        when(fuelRecordRepository.findById(id)).thenReturn(Optional.of(record));
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(driverRepository.findById(req.getDriverId())).thenReturn(Optional.of(driver));
        when(fuelMisuseService.checkForMisuse(any())).thenReturn(null);
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
        when(driverRepository.findFuelMetadataDrivers())
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

