package com.vfms.maintenance;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import com.vfms.vehicle.VehicleStatus;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Vehicle testVehicle;
    private MaintenanceRequest testMaintenanceRequest;
    private MaintenanceRequestDto testRequestDto;

    @BeforeEach
    void setUp() {
        testVehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("TST-1234")
                .status(VehicleStatus.AVAILABLE)
                .build();

        testMaintenanceRequest = MaintenanceRequest.builder()
                .id(100L)
                .vehicle(testVehicle)
                .status(MaintenanceStatus.NEW)
                .maintenanceType(MaintenanceType.BREAKDOWN)
                .build();

        testRequestDto = new MaintenanceRequestDto();
        testRequestDto.setVehicleId(1L);
        testRequestDto.setMaintenanceType(MaintenanceType.BREAKDOWN);
        testRequestDto.setDescription("Engine knocking");
    }

    @Test
    void createRequest_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(maintenanceRepository.save(any(MaintenanceRequest.class))).thenReturn(testMaintenanceRequest);

        MaintenanceResponseDto response = maintenanceService.createRequest(testRequestDto);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(MaintenanceStatus.NEW, response.getStatus());
        verify(maintenanceRepository, times(1)).save(any(MaintenanceRequest.class));
    }

    @Test
    void createRequest_VehicleNotFound() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> maintenanceService.createRequest(testRequestDto));
    }

    @Test
    void approveRequest_Success() {
        testMaintenanceRequest.setStatus(MaintenanceStatus.SUBMITTED);
        when(maintenanceRepository.findById(100L)).thenReturn(Optional.of(testMaintenanceRequest));
        when(maintenanceRepository.save(any(MaintenanceRequest.class))).thenReturn(testMaintenanceRequest);

        MaintenanceResponseDto response = maintenanceService.approveRequest(100L);

        assertEquals(MaintenanceStatus.APPROVED, response.getStatus());
        assertEquals(VehicleStatus.UNDER_MAINTENANCE, testVehicle.getStatus());
        assertNotNull(testMaintenanceRequest.getApprovedDate());
        verify(maintenanceRepository, times(1)).save(testMaintenanceRequest);
    }

    @Test
    void approveRequest_ThrowsWhenNotSubmitted() {
        testMaintenanceRequest.setStatus(MaintenanceStatus.NEW); // Cannot approve NEW directly
        when(maintenanceRepository.findById(100L)).thenReturn(Optional.of(testMaintenanceRequest));

        assertThrows(IllegalStateException.class, () -> maintenanceService.approveRequest(100L));
    }

    @Test
    void closeRequest_Success() {
        testMaintenanceRequest.setStatus(MaintenanceStatus.APPROVED);
        when(maintenanceRepository.findById(100L)).thenReturn(Optional.of(testMaintenanceRequest));
        when(maintenanceRepository.save(any(MaintenanceRequest.class))).thenReturn(testMaintenanceRequest);

        MaintenanceResponseDto response = maintenanceService.closeRequest(100L, new BigDecimal("500.00"));

        assertEquals(MaintenanceStatus.CLOSED, response.getStatus());
        assertEquals(VehicleStatus.AVAILABLE, testVehicle.getStatus());
        assertEquals(new BigDecimal("500.00"), testMaintenanceRequest.getActualCost());
        assertNotNull(testMaintenanceRequest.getClosedDate());
    }
}
