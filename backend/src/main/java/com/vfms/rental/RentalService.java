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

        // ── Get All Rentals ──
    public java.util.List<RentalResponseDto> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Rentals By Status ──
    public java.util.List<RentalResponseDto> getRentalsByStatus(RentalStatus status) {
        return rentalRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Rentals By Vendor ──
    public java.util.List<RentalResponseDto> getRentalsByVendor(Long vendorId) {
        return rentalRepository.findByVendorId(vendorId).stream()
                .map(this::mapToResponse)
                .toList();
    }
        // ── Get Rental By ID ──
    public RentalResponseDto getRentalById(Long id) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        return mapToResponse(rental);
    }
        // ── Upload Agreement ──
    @Transactional
    public RentalResponseDto uploadAgreement(Long id, String agreementUrl) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        rental.setAgreementUrl(agreementUrl);
        return mapToResponse(rentalRepository.save(rental));
    }

    // ── Upload Invoice ──
    @Transactional
    public RentalResponseDto uploadInvoice(Long id, String invoiceUrl) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));
        if (rental.getStatus() != RentalStatus.RETURNED && rental.getStatus() != RentalStatus.CLOSED) {
            throw new RuntimeException("Invoice can only be uploaded for returned/closed rentals");
        }
        rental.setInvoiceUrl(invoiceUrl);
        return mapToResponse(rentalRepository.save(rental));
    }
        // ── Confirm Return ──
    @Transactional
    public RentalResponseDto confirmReturn(Long id, java.time.LocalDate returnDate) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new RuntimeException("Can only confirm return for ACTIVE rentals");
        }

        rental.setStatus(RentalStatus.RETURNED);
        rental.setEndDate(returnDate);
        rental.calculateTotalCost();

        return mapToResponse(rentalRepository.save(rental));
    }
        // ── Close Rental ──
    @Transactional
    public RentalResponseDto closeRental(Long id) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rental not found"));

        if (rental.getStatus() != RentalStatus.RETURNED) {
            throw new RuntimeException("Can only close RETURNED rentals");
        }

        rental.setStatus(RentalStatus.CLOSED);
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
