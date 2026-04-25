package com.vfms.maintenance;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    // ── Create Request ──
    @Transactional
    public MaintenanceResponseDto createRequest(MaintenanceRequestDto request) {
        Vehicle vehicle = vehicleRepository
                .findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        MaintenanceRequest mr = MaintenanceRequest.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .estimatedCost(request.getEstimatedCost())
                .build();

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Edit Request ──
    // Requests can only be edited while in NEW status. Once submitted,
    // the approval workflow begins and details must remain locked for audit integrity.
    @Transactional
    public MaintenanceResponseDto updateRequest(Long id, MaintenanceRequestDto request) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new IllegalStateException("Can only edit requests in NEW status");
        }

        Vehicle vehicle = vehicleRepository
                .findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        mr.setVehicle(vehicle);
        mr.setMaintenanceType(request.getMaintenanceType());
        mr.setDescription(request.getDescription());
        mr.setEstimatedCost(request.getEstimatedCost());

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Submit Request ──
    // Transitions request from NEW to SUBMITTED, locking it from further edits
    // and placing it in the queue for approvers.
    @Transactional
    public MaintenanceResponseDto submitRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new IllegalStateException("Can only submit requests in NEW status");
        }

        mr.setStatus(MaintenanceStatus.SUBMITTED);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Approve Request ──
    // Approves the maintenance work and automatically changes the underlying vehicle's
    // status to UNDER_MAINTENANCE to prevent it from being scheduled for trips/rentals.
    @Transactional
    public MaintenanceResponseDto approveRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new IllegalStateException("Can only approve SUBMITTED requests");
        }

        mr.setStatus(MaintenanceStatus.APPROVED);
        mr.setApprovedDate(LocalDateTime.now());

        // Auto-change vehicle status to UNDER_MAINTENANCE
        mr.getVehicle().setStatus(com.vfms.vehicle.VehicleStatus.UNDER_MAINTENANCE);

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Reject Request ──
    // Rejects the request with a mandatory reason, keeping the record for the audit trail.
    @Transactional
    public MaintenanceResponseDto rejectRequest(Long id, String reason) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new IllegalStateException("Can only reject SUBMITTED requests");
        }

        mr.setStatus(MaintenanceStatus.REJECTED);
        mr.setRejectionReason(reason);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Close Request ──
    // Finalizes the request. If it was approved, we record the final actual cost and
    // free up the vehicle by changing its status back to AVAILABLE.
    @Transactional
    public MaintenanceResponseDto closeRequest(Long id, BigDecimal actualCost) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        MaintenanceStatus originalStatus = mr.getStatus();

        if (originalStatus != MaintenanceStatus.APPROVED && originalStatus != MaintenanceStatus.REJECTED) {
            throw new IllegalStateException("Can only close APPROVED or REJECTED requests");
        }

        mr.setClosedDate(LocalDateTime.now());
        mr.setActualCost(actualCost);
        mr.setStatus(MaintenanceStatus.CLOSED);

        // Restore vehicle to AVAILABLE only if approved (maintenance actually happened and is now done)
        // If REJECTED, maintenance never started so vehicle status is unchanged
        if (originalStatus == MaintenanceStatus.APPROVED) {
            mr.getVehicle().setStatus(com.vfms.vehicle.VehicleStatus.AVAILABLE);
        }

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Get All Requests ──
    public List<MaintenanceResponseDto> getAllRequests() {
        return maintenanceRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    // ── Get Requests By Status ──
    public List<MaintenanceResponseDto> getRequestsByStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Requests By Vehicle ──
    public List<MaintenanceResponseDto> getRequestsByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Request By ID ──
    public MaintenanceResponseDto getRequestById(Long id) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));
        return mapToResponse(mr);
    }

    // ── Upload Quotation ──
    @Transactional
    public MaintenanceResponseDto uploadQuotation(Long id, String quotationUrl) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));
        mr.setQuotationUrl(quotationUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Upload Invoice ──
    @Transactional
    public MaintenanceResponseDto uploadInvoice(Long id, String invoiceUrl) {
        MaintenanceRequest mr = maintenanceRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));
        if (mr.getStatus() != MaintenanceStatus.APPROVED && mr.getStatus() != MaintenanceStatus.CLOSED) {
            throw new IllegalStateException("Invoice can only be uploaded for approved/closed requests");
        }
        mr.setInvoiceUrl(invoiceUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Get Downtime Report Per Vehicle ──
    public List<MaintenanceResponseDto> getDowntimeByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .filter(mr -> mr.getApprovedDate() != null && mr.getClosedDate() != null)
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Pending Approvals ──
    public List<MaintenanceResponseDto> getPendingApprovals() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.SUBMITTED).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Report: Total Maintenance Cost Summary ──
    public Map<String, Object> getMaintenanceCostSummary() {
        List<MaintenanceRequest> closed = maintenanceRepository.findByStatus(MaintenanceStatus.CLOSED);
        BigDecimal totalActual = closed.stream()
                .filter(mr -> mr.getActualCost() != null)
                .map(MaintenanceRequest::getActualCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEstimated = closed.stream()
                .filter(mr -> mr.getEstimatedCost() != null)
                .map(MaintenanceRequest::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalDowntimeHours = closed.stream()
                .filter(mr -> mr.getApprovedDate() != null && mr.getClosedDate() != null)
                .mapToLong(mr -> Duration.between(mr.getApprovedDate(), mr.getClosedDate())
                        .toHours())
                .sum();
        return Map.of(
                "totalClosedRequests", closed.size(),
                "totalActualCost", totalActual,
                "totalEstimatedCost", totalEstimated,
                "totalDowntimeHours", totalDowntimeHours);
    }

    // ── Report: Cost Breakdown by Maintenance Type ──
    public Map<String, BigDecimal> getCostByMaintenanceType() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.CLOSED).stream()
                .filter(mr -> mr.getActualCost() != null)
                .collect(Collectors.groupingBy(
                        mr -> mr.getMaintenanceType().name(),
                        Collectors.reducing(BigDecimal.ZERO, MaintenanceRequest::getActualCost, BigDecimal::add)));
    }

    // ── Report: Cost per Vehicle ──
    public List<Map<String, Object>> getCostPerVehicle() {
        return maintenanceRepository.findAll().stream()
                .filter(mr -> mr.getActualCost() != null)
                .collect(Collectors.groupingBy(mr -> mr.getVehicle().getId()))
                .entrySet()
                .stream()
                .map(entry -> {
                    var records = entry.getValue();
                    var first = records.get(0);
                    BigDecimal total = records.stream()
                            .map(MaintenanceRequest::getActualCost)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return (Map<String, Object>) Map.<String, Object>of(
                            "vehicleId", first.getVehicle().getId(),
                            "plateNumber", first.getVehicle().getPlateNumber(),
                            "brandModel",
                                    first.getVehicle().getBrand() + " "
                                            + first.getVehicle().getModel(),
                            "totalMaintenanceCost", total,
                            "requestCount", records.size());
                })
                .toList();
    }

    // ── Mapper ──
    MaintenanceResponseDto mapToResponse(MaintenanceRequest mr) {
        Long downtimeHours = null;
        if (mr.getApprovedDate() != null && mr.getClosedDate() != null) {
            downtimeHours =
                    Duration.between(mr.getApprovedDate(), mr.getClosedDate()).toHours();
        }

        return MaintenanceResponseDto.builder()
                .id(mr.getId())
                .vehicleId(mr.getVehicle().getId())
                .vehiclePlateNumber(mr.getVehicle().getPlateNumber())
                .vehicleBrandModel(
                        mr.getVehicle().getBrand() + " " + mr.getVehicle().getModel())
                .maintenanceType(mr.getMaintenanceType())
                .description(mr.getDescription())
                .status(mr.getStatus())
                .estimatedCost(mr.getEstimatedCost())
                .actualCost(mr.getActualCost())
                .requestedDate(mr.getRequestedDate())
                .approvedDate(mr.getApprovedDate())
                .closedDate(mr.getClosedDate())
                .rejectionReason(mr.getRejectionReason())
                .quotationUrl(mr.getQuotationUrl())
                .invoiceUrl(mr.getInvoiceUrl())
                .downtimeHours(downtimeHours)
                .createdAt(mr.getCreatedAt())
                .updatedAt(mr.getUpdatedAt())
                .build();
    }
}
