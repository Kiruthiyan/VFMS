package com.vfms.maintenance;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import com.vfms.vehicle.VehicleStatus;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceAdditionalTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Vehicle vehicle;
    private MaintenanceRequest request;
    private MaintenanceRequestDto requestDto;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(10L)
                .plateNumber("CP-1000")
                .brand("Toyota")
                .model("Axio")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();

        request = MaintenanceRequest.builder()
                .id(50L)
                .vehicle(vehicle)
                .maintenanceType(MaintenanceType.ROUTINE_SERVICE)
                .description("Oil change")
                .status(MaintenanceStatus.NEW)
                .build();

        requestDto = new MaintenanceRequestDto();
        requestDto.setVehicleId(10L);
        requestDto.setMaintenanceType(MaintenanceType.ROUTINE_SERVICE);
        requestDto.setDescription("Oil change");
        requestDto.setEstimatedCost(new BigDecimal("2500.00"));
    }

    @Test
    void createRequest_ThrowsWhenVehicleHasOpenRequest() {
        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByVehicleIdAndStatusIn(any(), any()))
                .thenReturn(List.of(request));

        assertThrows(IllegalStateException.class, () -> maintenanceService.createRequest(requestDto));
        verify(maintenanceRepository, never()).save(any(MaintenanceRequest.class));
    }

    @Test
    void updateRequest_ThrowsWhenStatusNotNew() {
        request.setStatus(MaintenanceStatus.SUBMITTED);
        when(maintenanceRepository.findById(50L)).thenReturn(Optional.of(request));

        assertThrows(IllegalStateException.class, () -> maintenanceService.updateRequest(50L, requestDto));
    }

    @Test
    void closeRequest_FromRejectedMovesToClosedWithoutVehicleStatusChange() {
        request.setStatus(MaintenanceStatus.REJECTED);
        when(maintenanceRepository.findById(50L)).thenReturn(Optional.of(request));
        when(maintenanceRepository.save(request)).thenReturn(request);

        MaintenanceResponseDto response = maintenanceService.closeRequest(50L, BigDecimal.ZERO);

        assertEquals(MaintenanceStatus.CLOSED, response.getStatus());
        assertEquals(VehicleStatus.AVAILABLE, vehicle.getStatus());
    }

    @Test
    void uploadInvoice_ThrowsWhenRequestNotApprovedOrClosed() {
        request.setStatus(MaintenanceStatus.NEW);
        when(maintenanceRepository.findById(50L)).thenReturn(Optional.of(request));

        assertThrows(IllegalStateException.class, () -> maintenanceService.uploadInvoice(50L, "supabase://x/y.pdf"));
    }

    @Test
    void uploadQuotation_ThrowsWhenRequestIsNotNew() {
        request.setStatus(MaintenanceStatus.SUBMITTED);
        when(maintenanceRepository.findById(50L)).thenReturn(Optional.of(request));

        assertThrows(IllegalStateException.class, () -> maintenanceService.uploadQuotation(50L, "supabase://x/y.pdf"));
    }
}
