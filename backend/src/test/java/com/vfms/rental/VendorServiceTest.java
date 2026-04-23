package com.vfms.rental;

import com.vfms.rental.dto.VendorDto;
import com.vfms.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VendorServiceTest {

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private VendorService vendorService;

    private Vendor testVendor;
    private VendorDto testVendorDto;

    @BeforeEach
    void setUp() {
        testVendor = Vendor.builder()
                .id(1L)
                .name("Acme Rentals")
                .contactPerson("John Doe")
                .active(true)
                .build();

        testVendorDto = new VendorDto();
        testVendorDto.setName("Acme Rentals");
        testVendorDto.setContactPerson("John Doe");
    }

    @Test
    void addVendor_Success() {
        when(vendorRepository.save(any(Vendor.class))).thenReturn(testVendor);

        Vendor result = vendorService.createVendor(testVendorDto);

        assertNotNull(result);
        assertEquals("Acme Rentals", result.getName());
        verify(vendorRepository, times(1)).save(any(Vendor.class));
    }

    @Test
    void toggleActive_Success() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.of(testVendor));
        when(vendorRepository.save(any(Vendor.class))).thenReturn(testVendor);

        Vendor result = vendorService.toggleActive(1L);

        assertFalse(result.isActive());
        verify(vendorRepository, times(1)).save(testVendor);
    }

    @Test
    void getVendorById_ThrowsResourceNotFoundException() {
        when(vendorRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vendorService.getVendorById(1L));
    }
}
