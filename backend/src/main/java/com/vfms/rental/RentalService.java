package com.vfms.rental;

import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
import com.vfms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final VendorRepository vendorRepository;

    // ── Create Rental ──
    // Creates a new rental record from a vendor. If an end date is provided immediately,
    // the system calculates the total cost upfront to simplify accounting.
    @Transactional
    public RentalResponseDto createRental(RentalRequestDto request) {
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", request.getVendorId()));

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

    // ── Edit Rental ──
    // Allows updating a rental while it is ACTIVE. Once RETURNED or CLOSED,
    // the rental details are frozen for historical accuracy.
    @Transactional
    public RentalResponseDto updateRental(Long id, RentalRequestDto request) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Can only edit ACTIVE rentals");
        }

        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", request.getVendorId()));

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
    public List<RentalResponseDto> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Rentals By Status ──
    public List<RentalResponseDto> getRentalsByStatus(RentalStatus status) {
        return rentalRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Rentals By Vendor ──
    public List<RentalResponseDto> getRentalsByVendor(Long vendorId) {
        return rentalRepository.findByVendorId(vendorId).stream()
                .map(this::mapToResponse)
                .toList();
    }
    // ── Get Rental By ID ──
    public RentalResponseDto getRentalById(Long id) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));
        return mapToResponse(rental);
    }
    // ── Upload Agreement ──
    @Transactional
    public RentalResponseDto uploadAgreement(Long id, String agreementUrl) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));
        rental.setAgreementUrl(agreementUrl);
        return mapToResponse(rentalRepository.save(rental));
    }

    // ── Upload Invoice ──
    @Transactional
    public RentalResponseDto uploadInvoice(Long id, String invoiceUrl) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));
        if (rental.getStatus() != RentalStatus.RETURNED && rental.getStatus() != RentalStatus.CLOSED) {
            throw new IllegalStateException("Invoice can only be uploaded for returned/closed rentals");
        }
        rental.setInvoiceUrl(invoiceUrl);
        return mapToResponse(rentalRepository.save(rental));
    }
    // ── Confirm Return ──
    // Marks the rental as RETURNED and triggers the final cost calculation 
    // based on the actual duration from start date to return date.
    @Transactional
    public RentalResponseDto confirmReturn(Long id, LocalDate returnDate) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Can only confirm return for ACTIVE rentals");
        }

        rental.setStatus(RentalStatus.RETURNED);
        rental.setEndDate(returnDate);
        rental.calculateTotalCost();

        return mapToResponse(rentalRepository.save(rental));
    }
    // ── Close Rental ──
    // Finalizes the rental. Ensures that the rental cannot be closed directly from ACTIVE
    // without confirming the return first.
    @Transactional
    public RentalResponseDto closeRental(Long id) {
        RentalRecord rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        if (rental.getStatus() != RentalStatus.RETURNED) {
            throw new IllegalStateException("Can only close RETURNED rentals");
        }

        rental.setStatus(RentalStatus.CLOSED);
        return mapToResponse(rentalRepository.save(rental));
    }


    // ── Report: Total Rental Cost Summary ──
    public Map<String, Object> getRentalCostSummary() {
        List<RentalRecord> all = rentalRepository.findAll();
        BigDecimal totalCost = all.stream()
                .filter(r -> r.getTotalCost() != null)
                .map(RentalRecord::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeCount = all.stream().filter(r -> r.getStatus() == RentalStatus.ACTIVE).count();
        long closedCount = all.stream().filter(r -> r.getStatus() == RentalStatus.CLOSED).count();
        return Map.of(
                "totalRentals", all.size(),
                "activeRentals", activeCount,
                "closedRentals", closedCount,
                "totalRentalCost", totalCost
        );
    }

    // ── Report: Cost per Vendor ──
    public List<Map<String, Object>> getCostPerVendor() {
        return rentalRepository.findAll().stream()
                .filter(r -> r.getTotalCost() != null)
                .collect(Collectors.groupingBy(r -> r.getVendor().getId()))
                .entrySet().stream()
                .map(entry -> {
                    var records = entry.getValue();
                    var first = records.get(0);
                    BigDecimal total = records.stream()
                            .map(RentalRecord::getTotalCost)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return (Map<String, Object>) Map.<String, Object>of(
                            "vendorId", first.getVendor().getId(),
                            "vendorName", first.getVendor().getName(),
                            "totalRentalCost", total,
                            "rentalCount", records.size()
                    );
                })
                .toList();
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
