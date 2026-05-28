package com.vfms.service;

import com.vfms.dto.DashboardStatsDTO;
import com.vfms.dto.TripStatsDTO;
import com.vfms.entity.*;
import com.vfms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReportServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private DriverRepository driverRepository;
    @Mock
    private TripRequestRepository tripRequestRepository;
    @Mock
    private MaintenanceLogRepository maintenanceLogRepository;
    @Mock
    private FuelLogRepository fuelLogRepository;

    @InjectMocks
    private ReportService reportService;

    private Vehicle testVehicle;
    private Driver testDriver;
    private FuelLog testFuelLog;
    private MaintenanceLog testMaintenanceLog;

    @BeforeEach
    void setUp() {
        testVehicle = Vehicle.builder()
                .id(1L)
                .name("Toyota Hilux")
                .licensePlate("KA-01-AB-1234")
                .department("Logistics")
                .totalDistance(1000.0)
                .build();

        testDriver = Driver.builder()
                .id(UUID.randomUUID())
                .name("Test Driver")
                .rating(4.5)
                .build();

        testFuelLog = FuelLog.builder()
                .id(1L)
                .vehicle(testVehicle)
                .fuelQuantity(50.0)
                .totalCost(500.0)
                .date(LocalDate.now())
                .build();

        testMaintenanceLog = new MaintenanceLog();
        testMaintenanceLog.setId(1L);
        testMaintenanceLog.setVehicle(testVehicle);
        testMaintenanceLog.setCost(1000.0);
        testMaintenanceLog.setMaintenanceDate(LocalDate.now());
    }

    @Test
    void getDashboardStats_ShouldReturnCorrectTotalFuelCost() {
        when(fuelLogRepository.getTotalFuelSpend()).thenReturn(500.0);
        when(fuelLogRepository.getTotalFuelConsumption()).thenReturn(50.0);
        when(maintenanceLogRepository.findAll()).thenReturn(Arrays.asList(testMaintenanceLog));
        when(vehicleRepository.getTotalFleetDistance()).thenReturn(1000.0);
        when(vehicleRepository.count()).thenReturn(3L);

        DashboardStatsDTO result = reportService.getDashboardStats();

        assertNotNull(result);
        assertEquals(500.0, result.getTotalFuelCost());
        assertEquals(1000.0, result.getTotalMaintenanceCost());
        assertEquals(3L, result.getTotalVehicles());
    }

    @Test
    void getDashboardStats_WhenFuelCostIsNull_ShouldReturnZero() {
        when(fuelLogRepository.getTotalFuelSpend()).thenReturn(null);
        when(fuelLogRepository.getTotalFuelConsumption()).thenReturn(null);
        when(maintenanceLogRepository.findAll()).thenReturn(Collections.emptyList());
        when(vehicleRepository.getTotalFleetDistance()).thenReturn(null);
        when(vehicleRepository.count()).thenReturn(0L);

        DashboardStatsDTO result = reportService.getDashboardStats();

        assertNotNull(result);
        assertEquals(0.0, result.getTotalFuelCost());
        assertEquals(0.0, result.getTotalDistance());
    }

    @Test
    void getTripStats_ShouldCountStatusesCorrectly() {
        TripRequest completedTrip = new TripRequest();
        completedTrip.setId(UUID.randomUUID());
        completedTrip.setStatus("COMPLETED");

        TripRequest pendingTrip = new TripRequest();
        pendingTrip.setId(UUID.randomUUID());
        pendingTrip.setStatus("PENDING");

        TripRequest rejectedTrip = new TripRequest();
        rejectedTrip.setId(UUID.randomUUID());
        rejectedTrip.setStatus("REJECTED");

        when(tripRequestRepository.findAll())
                .thenReturn(Arrays.asList(completedTrip, pendingTrip, rejectedTrip));

        TripStatsDTO result = reportService.getTripStats();

        assertNotNull(result);
        assertEquals(3L, result.getTotal());
        assertEquals(1L, result.getCompleted());
        assertEquals(1L, result.getPending());
        assertEquals(1L, result.getRejected());
    }

    @Test
    void getTripStats_WhenNoTrips_ShouldReturnAllZeros() {
        when(tripRequestRepository.findAll()).thenReturn(Collections.emptyList());

        TripStatsDTO result = reportService.getTripStats();

        assertNotNull(result);
        assertEquals(0L, result.getTotal());
        assertEquals(0L, result.getCompleted());
        assertEquals(0L, result.getPending());
    }

    @Test
    void getVehicleUtilization_ShouldReturnDataForAllVehicles() {
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(testVehicle));
        when(tripRequestRepository.findAll()).thenReturn(Collections.emptyList());
        when(fuelLogRepository.findAll()).thenReturn(Arrays.asList(testFuelLog));

        var result = reportService.getVehicleUtilization();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("KA-01-AB-1234", result.get(0).getLicensePlate());
    }

    @Test
    void getDriverPerformance_ShouldReturnDataForAllDrivers() {
        when(driverRepository.findAll()).thenReturn(Arrays.asList(testDriver));
        when(tripRequestRepository.findAll()).thenReturn(Collections.emptyList());

        var result = reportService.getDriverPerformance();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Driver", result.get(0).getDriverName());
        assertEquals(4.5, result.get(0).getRating());
    }
}
