package com.vfms.rental;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.rental.dto.VendorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    @Transactional
    public Vendor createVendor(VendorDto dto) {
        Vendor vendor = Vendor.builder()
                .name(dto.getName())
                .contactPerson(dto.getContactPerson())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .build();
        return vendorRepository.save(vendor);
    }

    @Transactional
    public Vendor updateVendor(Long id, VendorDto dto) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));

        vendor.setName(dto.getName());
        vendor.setContactPerson(dto.getContactPerson());
        vendor.setPhone(dto.getPhone());
        vendor.setEmail(dto.getEmail());
        vendor.setAddress(dto.getAddress());

        return vendorRepository.save(vendor);
    }

    // Filters by active=true so deactivated vendors are invisible to normal operations, preventing new rentals from being assigned to retired vendors
    public List<Vendor> getAllVendors() {
        return vendorRepository.findByActiveTrue();
    }

    public List<Vendor> getAllVendorsIncludingInactive() {
        return vendorRepository.findAll();
    }

    // Soft-toggles active status rather than deleting so historical rental records tied to this vendor remain intact for auditing and cost reporting
    @Transactional
    public Vendor toggleActive(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));

        vendor.setActive(!vendor.getActive());

        return vendorRepository.save(vendor);
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
    }
}