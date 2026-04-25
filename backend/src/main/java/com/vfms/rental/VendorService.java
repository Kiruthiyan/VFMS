package com.vfms.rental;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.rental.dto.VendorDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorRepository vendorRepository;

    // ── Create Vendor ──
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

    // ── Edit Vendor ──
    @Transactional
    public Vendor updateVendor(Long id, VendorDto dto) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setName(dto.getName());
        vendor.setContactPerson(dto.getContactPerson());
        vendor.setPhone(dto.getPhone());
        vendor.setEmail(dto.getEmail());
        vendor.setAddress(dto.getAddress());
        return vendorRepository.save(vendor);
    }

    // ── Get Active Vendors ──
    public List<Vendor> getAllVendors() {
        return vendorRepository.findByActiveTrue();
    }

    // ── Get All Vendors ──
    public List<Vendor> getAllVendorsIncludingInactive() {
        return vendorRepository.findAll();
    }

    // ── Toggle Active Status ──
    // Uses soft deletion by toggling the active status. This preserves
    // historical rental records tied to this vendor for audit and reporting.
    @Transactional
    public Vendor toggleActive(Long id) {
        Vendor vendor = vendorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
        vendor.setActive(!vendor.getActive());
        return vendorRepository.save(vendor);
    }

    // ── Get Vendor By ID ──
    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Vendor", id));
    }
}
