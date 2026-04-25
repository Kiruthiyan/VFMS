package com.vfms.rental;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.rental.dto.RentalRequestDto;
import com.vfms.rental.dto.RentalResponseDto;
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

    @Transactional
    public RentalResponseDto createRental(RentalRequestDto request) {
        Vendor vendor = vendorRepository
                .findById(request.getVendorId())
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

        // End date may not be known at the time of creation, so we only pre-calculate cost when it is provided to avoid storing incomplete data.
        if (request.getEndDate() != null) {
            rental.calculateTotalCost();
        }

        return mapToResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponseDto updateRental(Long id, RentalRequestDto request) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        // Preventing edits on non-ACTIVE rentals preserves the integrity of historical records that have already been returned or closed.
        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Can only edit ACTIVE rentals");
        }

        Vendor vendor = vendorRepository
                .findById(request.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor", request.getVendorId()));

        rental.setVendor(vendor);
        rental.setVehicleType(request.getVehicleType());
        rental.setPlateNumber(request.getPlateNumber());
        rental.setStartDate(request.getStartDate());
        rental.setEndDate(request.getEndDate());
        rental.setCostPerDay(request.getCostPerDay());
        rental.setPurpose(request.getPurpose());

        // Recalculate cost on every update since the rate or duration may have changed.
        if (request.getEndDate() != null) {
            rental.calculateTotalCost();
        }

        return mapToResponse(rentalRepository.save(rental));
    }

    public List<RentalResponseDto> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<RentalResponseDto> getRentalsByStatus(RentalStatus status) {
        return rentalRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<RentalResponseDto> getRentalsByVendor(Long vendorId) {
        return rentalRepository.findByVendorId(vendorId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RentalResponseDto getRentalById(Long id) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));
        return mapToResponse(rental);
    }

    @Transactional
    public RentalResponseDto uploadAgreement(Long id, String agreementUrl) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));
        rental.setAgreementUrl(agreementUrl);
        return mapToResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponseDto uploadInvoice(Long id, String invoiceUrl) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        // Invoices are only valid once the vehicle has been returned, since the final billable amount cannot be confirmed while the rental is still ongoing.
        if (rental.getStatus() != RentalStatus.RETURNED && rental.getStatus() != RentalStatus.CLOSED) {
            throw new IllegalStateException("Invoice can only be uploaded for returned/closed rentals");
        }

        rental.setInvoiceUrl(invoiceUrl);
        return mapToResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponseDto confirmReturn(Long id, LocalDate returnDate) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        if (rental.getStatus() != RentalStatus.ACTIVE) {
            throw new IllegalStateException("Can only confirm return for ACTIVE rentals");
        }

        rental.setStatus(RentalStatus.RETURNED);
        rental.setEndDate(returnDate);
        // Cost is recalculated here using the actual return date rather than any estimated end date set at creation, ensuring billing reflects true usage.
        rental.calculateTotalCost();

        return mapToResponse(rentalRepository.save(rental));
    }

    @Transactional
    public RentalResponseDto closeRental(Long id) {
        RentalRecord rental = rentalRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RentalRecord", id));

        // Closing is only permitted after RETURNED to enforce a two-step sign-off: vehicle is physically back before the record is finalized.
        if (rental.getStatus() != RentalStatus.RETURNED) {
            throw new IllegalStateException("Can only close RETURNED rentals");
        }

        rental.setStatus(RentalStatus.CLOSED);
        return mapToResponse(rentalRepository.save(rental));
    }

    public Map<String, Object> getRentalCostSummary() {
        List<RentalRecord> all = rentalRepository.findAll();

        BigDecimal totalCost = all.stream()
                .filter(r -> r.getTotalCost() != null)
                .map(RentalRecord::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeCount = all.stream()
                .filter(r -> r.getStatus() == RentalStatus.ACTIVE)
                .count();

        long closedCount = all.stream()
                .filter(r -> r.getStatus() == RentalStatus.CLOSED)
                .count();

        return Map.of(
                "totalRentals", all.size(),
                "activeRentals", activeCount,
                "closedRentals", closedCount,
                "totalRentalCost", totalCost);
    }

    public List<Map<String, Object>> getCostPerVendor() {
        return rentalRepository.findAll().stream()
                // Rentals without a total cost are excluded because they are still in progress and would skew vendor-level spending figures.
                .filter(r -> r.getTotalCost() != null)
                .collect(Collectors.groupingBy(r -> r.getVendor().getId()))
                .entrySet()
                .stream()
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
                            "rentalCount", records.size());
                })
                .toList();
    }

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