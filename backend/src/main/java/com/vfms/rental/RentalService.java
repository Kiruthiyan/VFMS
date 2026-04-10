package com.vfms.rental;

import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VendorRepository vendorRepository;

    @Transactional
    public RentalResponseDto createRental(RentalRequestDto request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        RentalRecord rental = RentalRecord.builder()
                .vendor(vendor)
                .vehicleType(request.getVehicleType())
                .plateNumber(request.getPlateNumber())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .costPerDay(request.getCostPerDay())
                .purpose(request.getPurpose())
                .build();

        if (request.getEndDate() != null) {
            rental.calculateTotalCost();
        }

        return mapToResponse(rentalRepository.save(rental));
    }

    // ── Mapper ──
    RentalResponseDto mapToResponse(RentalRecord r) {
        return RentalResponseDto.builder()
                .id(r.getId())
                .vendorId(r.getVendor().getId())
                .vendorName(r.getVendor().getName())
                .vehicleType(r.getVehicleType())
                .plateNumber(r.getPlateNumber())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .costPerDay(r.getCostPerDay())
                .totalCost(r.getTotalCost())
                .purpose(r.getPurpose())
                .status(r.getStatus())
                .agreementUrl(r.getAgreementUrl())
                .invoiceUrl(r.getInvoiceUrl())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
