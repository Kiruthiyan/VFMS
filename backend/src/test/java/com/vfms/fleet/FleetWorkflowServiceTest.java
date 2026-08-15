package com.vfms.fleet;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import com.vfms.maintenance.MaintenanceRepository;
import com.vfms.maintenance.MaintenanceRequest;
import com.vfms.maintenance.MaintenanceService;
import com.vfms.maintenance.MaintenanceStatus;
import com.vfms.maintenance.MaintenanceType;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.rental.RentalRecord;
import com.vfms.rental.RentalRepository;
import com.vfms.rental.RentalService;
import com.vfms.rental.RentalStatus;
import com.vfms.rental.Vendor;
import com.vfms.rental.VendorRepository;
import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import com.vfms.vehicle.VehicleStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class FleetWorkflowServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    @InjectMocks
    private RentalService rentalService;

    private Vehicle vehicle;
    private Vendor vendor;

    @BeforeEach
    void setUp() {
        vehicle = Vehicle.builder()
                .id(10L)
                .plateNumber("CP-AXI-1001")
                .brand("Toyota")
                .model("Axio")
                .status(VehicleStatus.AVAILABLE)
                .active(true)
                .build();

        vendor = Vendor.builder()
                .id(20L)
                .name("City Rentals")
                .active(true)
                .build();
    }

    @Test
    void maintenanceWorkflow_newSubmittedApprovedClosed_changesStatusAndVehicleLifecycle() {
        MaintenanceRequestDto createDto = new MaintenanceRequestDto();
        createDto.setVehicleId(10L);
        createDto.setMaintenanceType(MaintenanceType.ROUTINE_SERVICE);
        createDto.setDescription("Engine service");
        createDto.setEstimatedCost(new BigDecimal("2500.00"));

        AtomicReference<MaintenanceRequest> store = new AtomicReference<>();

        when(vehicleRepository.findById(10L)).thenReturn(Optional.of(vehicle));
        when(maintenanceRepository.findByVehicleIdAndStatusIn(eq(10L), any())).thenReturn(List.of());
        when(maintenanceRepository.save(any(MaintenanceRequest.class))).thenAnswer(invocation -> {
            MaintenanceRequest req = invocation.getArgument(0);
            if (req.getId() == null) {
                req.setId(100L);
            }
            store.set(req);
            return req;
        });
        when(maintenanceRepository.findById(100L)).thenAnswer(invocation -> Optional.ofNullable(store.get()));

        MaintenanceResponseDto created = maintenanceService.createRequest(createDto);
        assertEquals(MaintenanceStatus.NEW, created.getStatus());

        MaintenanceResponseDto submitted = maintenanceService.submitRequest(100L);
        assertEquals(MaintenanceStatus.SUBMITTED, submitted.getStatus());

        MaintenanceResponseDto approved = maintenanceService.approveRequest(100L);
        assertEquals(MaintenanceStatus.APPROVED, approved.getStatus());
        assertEquals(VehicleStatus.UNDER_MAINTENANCE, vehicle.getStatus());

        MaintenanceResponseDto closed = maintenanceService.closeRequest(100L, new BigDecimal("3000.00"));
        assertEquals(MaintenanceStatus.CLOSED, closed.getStatus());
        assertEquals(VehicleStatus.AVAILABLE, vehicle.getStatus());
        assertEquals(new BigDecimal("3000.00"), closed.getActualCost());
    }

    @Test
    void rentalWorkflow_activeReturnedClosed_updatesStatusAndCalculatesCost() {
        RentalRequestDto createDto = new RentalRequestDto();
        createDto.setVendorId(20L);
        createDto.setVehicleType("VAN");
        createDto.setPlateNumber("WP-CAB-7788");
        createDto.setStartDate(LocalDate.of(2026, 8, 10));
        createDto.setCostPerDay(new BigDecimal("5000.00"));
        createDto.setPurpose("Staff movement");

        AtomicReference<RentalRecord> store = new AtomicReference<>();

        when(vendorRepository.findById(20L)).thenReturn(Optional.of(vendor));
        when(rentalRepository.findByPlateNumberIgnoreCaseAndStatus("WP-CAB-7788", RentalStatus.ACTIVE))
                .thenReturn(List.of());
        when(rentalRepository.save(any(RentalRecord.class))).thenAnswer(invocation -> {
            RentalRecord rec = invocation.getArgument(0);
            if (rec.getId() == null) {
                rec.setId(200L);
            }
            store.set(rec);
            return rec;
        });
        when(rentalRepository.findById(200L)).thenAnswer(invocation -> Optional.ofNullable(store.get()));

        RentalResponseDto created = rentalService.createRental(createDto);
        assertEquals(RentalStatus.ACTIVE, created.getStatus());

        RentalResponseDto returned = rentalService.confirmReturn(200L, LocalDate.of(2026, 8, 12));
        assertEquals(RentalStatus.RETURNED, returned.getStatus());
        assertNotNull(returned.getTotalCost());
        assertEquals(new BigDecimal("10000.00"), returned.getTotalCost());

        RentalResponseDto closed = rentalService.closeRental(200L);
        assertEquals(RentalStatus.CLOSED, closed.getStatus());
    }
}
