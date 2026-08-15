package com.vfms.rental;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RentalServiceAdditionalTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private RentalService rentalService;

    private Vendor vendor;
    private RentalRequestDto requestDto;
    private RentalRecord activeRental;

    @BeforeEach
    void setUp() {
        vendor = Vendor.builder().id(1L).name("City Rentals").active(true).build();

        requestDto = new RentalRequestDto();
        requestDto.setVendorId(1L);
        requestDto.setVehicleType("VAN");
        requestDto.setPlateNumber("WP-CAB-7788");
        requestDto.setStartDate(LocalDate.of(2026, 8, 10));
        requestDto.setEndDate(LocalDate.of(2026, 8, 12));
        requestDto.setCostPerDay(new BigDecimal("5000"));
        requestDto.setPurpose("Staff transport");

        activeRental = RentalRecord.builder()
                .id(100L)
                .vendor(vendor)
                .vehicleType("VAN")
                .plateNumber("WP-CAB-7788")
                .startDate(LocalDate.of(2026, 8, 11))
                .endDate(LocalDate.of(2026, 8, 15))
                .costPerDay(new BigDecimal("5000"))
                .status(RentalStatus.ACTIVE)
                .build();
    }

    @Test
    void createRental_ThrowsWhenEndDateBeforeStartDate() {
        requestDto.setEndDate(LocalDate.of(2026, 8, 9));

        assertThrows(IllegalArgumentException.class, () -> rentalService.createRental(requestDto));
    }

    @Test
    void createRental_ThrowsWhenOverlappingActiveRentalExists() {
        when(rentalRepository.findByPlateNumberIgnoreCaseAndStatus("WP-CAB-7788", RentalStatus.ACTIVE))
                .thenReturn(List.of(activeRental));

        assertThrows(IllegalStateException.class, () -> rentalService.createRental(requestDto));
        verify(vendorRepository, never()).findById(any());
    }

    @Test
    void uploadInvoice_ThrowsWhenRentalStillActive() {
        when(rentalRepository.findById(100L)).thenReturn(Optional.of(activeRental));

        assertThrows(IllegalStateException.class, () -> rentalService.uploadInvoice(100L, "supabase://bucket/rentals/x.pdf"));
    }

    @Test
    void closeRental_SuccessWhenReturned() {
        activeRental.setStatus(RentalStatus.RETURNED);
        when(rentalRepository.findById(100L)).thenReturn(Optional.of(activeRental));
        when(rentalRepository.save(activeRental)).thenReturn(activeRental);

        RentalResponseDto response = rentalService.closeRental(100L);

        assertEquals(RentalStatus.CLOSED, response.getStatus());
    }
}
