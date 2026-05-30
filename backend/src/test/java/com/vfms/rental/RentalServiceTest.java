package com.vfms.rental;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RentalServiceTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private RentalService rentalService;

    private Vendor testVendor;
    private RentalRecord testRentalRecord;
    private RentalRequestDto testRequestDto;

    @BeforeEach
    void setUp() {
        testVendor = Vendor.builder().id(1L).name("Acme Rentals").active(true).build();

        testRentalRecord = RentalRecord.builder()
                .id(10L)
                .vendor(testVendor)
                .status(RentalStatus.ACTIVE)
                .startDate(LocalDate.now().minusDays(2))
                .costPerDay(new BigDecimal("100.00"))
                .build();

        testRequestDto = new RentalRequestDto();
        testRequestDto.setVendorId(1L);
        testRequestDto.setStartDate(LocalDate.now());
        testRequestDto.setCostPerDay(new BigDecimal("100.00"));
    }

    @Test
    void createRental_Success() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(testVendor));
        when(rentalRepository.save(any(RentalRecord.class))).thenReturn(testRentalRecord);

        RentalResponseDto response = rentalService.createRental(testRequestDto);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        verify(rentalRepository, times(1)).save(any(RentalRecord.class));
    }

    @Test
    void createRental_VendorNotFound() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> rentalService.createRental(testRequestDto));
    }

    @Test
    void confirmReturn_Success() {
        when(rentalRepository.findById(10L)).thenReturn(Optional.of(testRentalRecord));
        when(rentalRepository.save(any(RentalRecord.class))).thenReturn(testRentalRecord);

        LocalDate returnDate = LocalDate.now();
        RentalResponseDto response = rentalService.confirmReturn(10L, returnDate);

        assertEquals(RentalStatus.RETURNED, response.getStatus());
        assertEquals(returnDate, testRentalRecord.getEndDate());
        assertNotNull(testRentalRecord.getTotalCost());
        verify(rentalRepository, times(1)).save(testRentalRecord);
    }

    @Test
    void confirmReturn_ThrowsWhenNotActive() {
        testRentalRecord.setStatus(RentalStatus.RETURNED);
        when(rentalRepository.findById(10L)).thenReturn(Optional.of(testRentalRecord));

        assertThrows(IllegalStateException.class, () -> rentalService.confirmReturn(10L, LocalDate.now()));
    }
}
