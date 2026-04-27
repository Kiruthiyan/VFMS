package com.vfms.fuel.service;

import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import com.vfms.vehicle.entity.Vehicle;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FuelMisuseService Unit Tests")
class FuelMisuseServiceTest {

    @Mock
    private FuelRecordRepository fuelRecordRepository;

    @InjectMocks
    private FuelMisuseService fuelMisuseService;

    @Test
    @DisplayName("Should flag when quantity exceeds configured maximum")
    void shouldFlagWhenQuantityTooHigh() throws Exception {
        setField("maxLitresPerEntry", 50.0);
        setField("maxEntriesPerDay", 3);

        FuelRecord record = baseRecord(BigDecimal.valueOf(60), 1000.0);

        String reason = fuelMisuseService.checkForMisuse(record);
        assertNotNull(reason);
        assertTrue(reason.contains("Quantity exceeds"));
    }

    @Test
    @DisplayName("Should flag when too many entries exist for vehicle on same day")
    void shouldFlagWhenTooManyEntriesSameDay() throws Exception {
        setField("maxLitresPerEntry", 100.0);
        setField("maxEntriesPerDay", 2);

        FuelRecord record = baseRecord(BigDecimal.valueOf(10), 1000.0);
        when(fuelRecordRepository.countByVehicleAndDate(any(), any())).thenReturn(2L);

        String reason = fuelMisuseService.checkForMisuse(record);
        assertNotNull(reason);
        assertTrue(reason.contains("maximum fuel entries"));
    }

    @Test
    @DisplayName("Should flag when odometer regresses compared to previous entry")
    void shouldFlagWhenOdometerRegresses() throws Exception {
        setField("maxLitresPerEntry", 100.0);
        setField("maxEntriesPerDay", 3);

        FuelRecord record = baseRecord(BigDecimal.valueOf(10), 900.0);
        FuelRecord prev = baseRecord(BigDecimal.valueOf(10), 1000.0);

        when(fuelRecordRepository.countByVehicleAndDate(any(), any())).thenReturn(0L);
        when(fuelRecordRepository.findLatestByVehicle(any())).thenReturn(List.of(prev));

        String reason = fuelMisuseService.checkForMisuse(record);
        assertNotNull(reason);
        assertTrue(reason.contains("Odometer reading"));
    }

    @Test
    @DisplayName("Should return null when no misuse rules are triggered")
    void shouldNotFlagWhenNormal() throws Exception {
        setField("maxLitresPerEntry", 100.0);
        setField("maxEntriesPerDay", 3);

        FuelRecord record = baseRecord(BigDecimal.valueOf(10), 1000.0);
        FuelRecord prev = baseRecord(BigDecimal.valueOf(10), 900.0);

        when(fuelRecordRepository.countByVehicleAndDate(any(), any())).thenReturn(0L);
        when(fuelRecordRepository.findLatestByVehicle(any())).thenReturn(List.of(prev));

        String reason = fuelMisuseService.checkForMisuse(record);
        assertNull(reason);
    }

    private FuelRecord baseRecord(BigDecimal qty, double odo) {
        Vehicle vehicle = Vehicle.builder().id(UUID.randomUUID()).build();
        return FuelRecord.builder()
                .id(UUID.randomUUID())
                .vehicle(vehicle)
                .fuelDate(LocalDate.now())
                .quantity(qty)
                .odometerReading(odo)
                .build();
    }

    private void setField(String field, Object value) throws Exception {
        var f = FuelMisuseService.class.getDeclaredField(field);
        f.setAccessible(true);
        f.set(fuelMisuseService, value);
    }
}

