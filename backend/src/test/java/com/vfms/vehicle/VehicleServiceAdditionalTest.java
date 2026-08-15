package com.vfms.vehicle;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.vehicle.dto.VehicleResponseDto;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VehicleServiceAdditionalTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle activeVehicle;
    private Vehicle retiredVehicle;

    @BeforeEach
    void setUp() {
        activeVehicle = Vehicle.builder()
                .id(1L)
                .plateNumber("CAR-1001")
                .brand("Toyota")
                .model("Aqua")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();

        retiredVehicle = Vehicle.builder()
                .id(2L)
                .plateNumber("CAR-2002")
                .brand("Nissan")
                .model("Sunny")
                .status(VehicleStatus.RETIRED)
                .active(false)
                .build();
    }

    @Test
    void getAllVehicles_ReturnsOnlyActiveVehicles() {
        when(vehicleRepository.findByActiveTrue()).thenReturn(List.of(activeVehicle));

        List<VehicleResponseDto> result = vehicleService.getAllVehicles();

        assertEquals(1, result.size());
        assertEquals("CAR-1001", result.get(0).getPlateNumber());
        verify(vehicleRepository).findByActiveTrue();
    }

    @Test
    void getVehiclesByStatus_RetiredUsesRetiredQuery() {
        when(vehicleRepository.findByStatus(VehicleStatus.RETIRED)).thenReturn(List.of(retiredVehicle));

        List<VehicleResponseDto> result = vehicleService.getVehiclesByStatus(VehicleStatus.RETIRED);

        assertEquals(1, result.size());
        assertEquals(VehicleStatus.RETIRED, result.get(0).getStatus());
        verify(vehicleRepository).findByStatus(VehicleStatus.RETIRED);
    }

    @Test
    void updateVehicleStatus_UpdatesStatusSuccessfully() {
        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(activeVehicle));
        when(vehicleRepository.save(activeVehicle)).thenReturn(activeVehicle);

        VehicleResponseDto result = vehicleService.updateVehicleStatus(1L, VehicleStatus.UNDER_MAINTENANCE);

        assertEquals(VehicleStatus.UNDER_MAINTENANCE, result.getStatus());
    }

    @Test
    void updateVehicleStatus_ThrowsWhenVehicleMissing() {
        when(vehicleRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.updateVehicleStatus(999L, VehicleStatus.AVAILABLE));
    }
}
