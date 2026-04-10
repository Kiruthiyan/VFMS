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

        // ── Edit Rental (only when ACTIVE) ──
    @Transactional
    public RentalResponseDto updateRental(Long id, RentalRequestDto request) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new RuntimeException("Can only edit ACTIVE rentals");
        }

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));

        rental.setVendor(vendor);
        rental.setVehicleType(request.getVehicleType());
        rental.setPlateNumber(request.getPlateNumber());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setCostPerDay(request.getCostPerDay());
        rental.setPurpose(request.getPurpose());

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
