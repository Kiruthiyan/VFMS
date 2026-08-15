package com.vfms.rental;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.rental.dto.VendorDto;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class VendorServiceAdditionalTest {

    @Mock
    private VendorRepository vendorRepository;

    @InjectMocks
    private VendorService vendorService;

    private Vendor vendor;

    @BeforeEach
    void setUp() {
        vendor = Vendor.builder()
                .id(7L)
                .name("Rapid Wheels")
                .contactPerson("Kamal")
                .active(true)
                .build();
    }

    @Test
    void getAllVendors_ReturnsOnlyActiveVendors() {
        when(vendorRepository.findByActiveTrue()).thenReturn(List.of(vendor));

        List<Vendor> result = vendorService.getAllVendors();

        assertEquals(1, result.size());
        assertEquals("Rapid Wheels", result.get(0).getName());
        verify(vendorRepository).findByActiveTrue();
    }

    @Test
    void toggleActive_ThrowsWhenVendorMissing() {
        when(vendorRepository.findById(77L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> vendorService.toggleActive(77L));
    }

    @Test
    void updateVendor_SuccessfullyUpdatesDetails() {
        VendorDto dto = new VendorDto();
        dto.setName("Rapid Wheels Updated");
        dto.setContactPerson("Nimal");
        dto.setPhone("0771234567");
        dto.setEmail("rapid@example.com");
        dto.setAddress("Colombo");

        when(vendorRepository.findById(7L)).thenReturn(Optional.of(vendor));
        when(vendorRepository.save(any(Vendor.class))).thenReturn(vendor);

        Vendor result = vendorService.updateVendor(7L, dto);

        assertEquals("Rapid Wheels Updated", result.getName());
        assertFalse(result.getName().isBlank());
    }
}
