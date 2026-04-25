package com.vfms.vehicle;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.vehicle.dto.VehicleRequestDto;
import com.vfms.vehicle.dto.VehicleResponseDto;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle testVehicle;
    private VehicleRequestDto testRequestDto;

    @BeforeEach
    void setUp() {
        testVehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("TST-1234")
                .brand("Toyota")
                .model("Hilux")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();

        testRequestDto = new VehicleRequestDto();
        testRequestDto.setPlateNumber("TST-1234");
        testRequestDto.setBrand("Toyota");
        testRequestDto.setModel("Hilux");
    }

    @Test
    void addVehicle_Success() {
        when(vehicleRepository.existsByPlateNumber("TST-1234")).thenReturn(false);
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        VehicleResponseDto response = vehicleService.addVehicle(testRequestDto);

        assertNotNull(response);
        assertEquals("TST-1234", response.getPlateNumber());
        assertEquals("Toyota", response.getBrand());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void addVehicle_ThrowsExceptionWhenPlateExists() {
        when(vehicleRepository.existsByPlateNumber("TST-1234")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> vehicleService.addVehicle(testRequestDto));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void getVehicleById_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));

        VehicleResponseDto response = vehicleService.getVehicleById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void getVehicleById_ThrowsResourceNotFoundException() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById(1L));
    }

    @Test
    void retireVehicle_Success() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(testVehicle));
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(testVehicle);

        VehicleResponseDto response = vehicleService.retireVehicle(1L);

        assertNotNull(response);
        assertFalse(testVehicle.getActive());
        assertEquals(VehicleStatus.RETIRED, testVehicle.getStatus());
        verify(vehicleRepository, times(1)).save(testVehicle);
    }
}
