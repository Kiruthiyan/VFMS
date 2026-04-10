package com.vfms.rental;

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
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setName(dto.getName());
        vendor.setContactPerson(dto.getContactPerson());
        vendor.setPhone(dto.getPhone());
        vendor.setEmail(dto.getEmail());
        vendor.setAddress(dto.getAddress());
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findByActiveTrue();
    }

    public List<Vendor> getAllVendorsIncludingInactive() {
        return vendorRepository.findAll();
    }

    @Transactional
    public Vendor toggleActive(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        vendor.setActive(!vendor.isActive());
        return vendorRepository.save(vendor);
    }

    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
    }
}

