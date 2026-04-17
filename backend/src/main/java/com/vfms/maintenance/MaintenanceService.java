package com.vfms.maintenance;

import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    // ── Create Request ──
    @Transactional
    public MaintenanceResponseDto createRequest(MaintenanceRequestDto request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        MaintenanceRequest mr = MaintenanceRequest.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .estimatedCost(request.getEstimatedCost())
                .build();

        return mapToResponse(maintenanceRepository.save(mr));
    }

        // ── Edit Request (only when NEW) ──
    @Transactional
    public MaintenanceResponseDto updateRequest(Long id, MaintenanceRequestDto request) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new RuntimeException("Can only edit requests in NEW status");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        mr.setVehicle(vehicle);
        mr.setMaintenanceType(request.getMaintenanceType());
        mr.setDescription(request.getDescription());
        mr.setEstimatedCost(request.getEstimatedCost());

        return mapToResponse(maintenanceRepository.save(mr));
    }

        // ── Submit Request ──
    @Transactional
    public MaintenanceResponseDto submitRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new RuntimeException("Can only submit requests in NEW status");
        }

        mr.setStatus(MaintenanceStatus.SUBMITTED);
        return mapToResponse(maintenanceRepository.save(mr));
    }

        // ── Approve Request ──
    @Transactional
    public MaintenanceResponseDto approveRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new RuntimeException("Can only approve SUBMITTED requests");
        }

        mr.setStatus(MaintenanceStatus.APPROVED);
        mr.setApprovedDate(java.time.LocalDateTime.now());

        // Auto-change vehicle status to UNDER_MAINTENANCE
        mr.getVehicle().setStatus(com.vfms.vehicle.VehicleStatus.UNDER_MAINTENANCE);

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Reject Request ──
    @Transactional
    public MaintenanceResponseDto rejectRequest(Long id, String reason) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new RuntimeException("Can only reject SUBMITTED requests");
        }

        mr.setStatus(MaintenanceStatus.REJECTED);
        mr.setRejectionReason(reason);
        return mapToResponse(maintenanceRepository.save(mr));
    }

        // ── Close Request ──
    @Transactional
    public MaintenanceResponseDto closeRequest(Long id, java.math.BigDecimal actualCost) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        MaintenanceStatus originalStatus = mr.getStatus();

        if (originalStatus != MaintenanceStatus.APPROVED && originalStatus != MaintenanceStatus.REJECTED) {
            throw new RuntimeException("Can only close APPROVED or REJECTED requests");
        }

        mr.setClosedDate(java.time.LocalDateTime.now());
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
    public java.util.List<MaintenanceResponseDto> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Requests By Status ──
    public java.util.List<MaintenanceResponseDto> getRequestsByStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Requests By Vehicle ──
    public java.util.List<MaintenanceResponseDto> getRequestsByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToResponse)
                .toList();
    }

        // ── Get Request By ID ──
    public MaintenanceResponseDto getRequestById(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return mapToResponse(mr);
    }

        // ── Upload Quotation ──
    @Transactional
    public MaintenanceResponseDto uploadQuotation(Long id, String quotationUrl) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        mr.setQuotationUrl(quotationUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // ── Upload Invoice ──
    @Transactional
    public MaintenanceResponseDto uploadInvoice(Long id, String invoiceUrl) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (mr.getStatus() != MaintenanceStatus.APPROVED && mr.getStatus() != MaintenanceStatus.CLOSED) {
            throw new RuntimeException("Invoice can only be uploaded for approved/closed requests");
        }
        mr.setInvoiceUrl(invoiceUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

        // ── Get Downtime Report Per Vehicle ──
    public java.util.List<MaintenanceResponseDto> getDowntimeByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .filter(mr -> mr.getApprovedDate() != null && mr.getClosedDate() != null)
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Pending Approvals ──
    public java.util.List<MaintenanceResponseDto> getPendingApprovals() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.SUBMITTED).stream()
                .map(this::mapToResponse)
                .toList();
    }




    // ── Report: Total Maintenance Cost Summary ──
    public java.util.Map<String, Object> getMaintenanceCostSummary() {
        java.util.List<MaintenanceRequest> closed = maintenanceRepository.findByStatus(MaintenanceStatus.CLOSED);
        java.math.BigDecimal totalActual = closed.stream()
                .filter(mr -> mr.getActualCost() != null)
                .map(MaintenanceRequest::getActualCost)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        java.math.BigDecimal totalEstimated = closed.stream()
                .filter(mr -> mr.getEstimatedCost() != null)
                .map(MaintenanceRequest::getEstimatedCost)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        long totalDowntimeHours = closed.stream()
                .filter(mr -> mr.getApprovedDate() != null && mr.getClosedDate() != null)
                .mapToLong(mr -> Duration.between(mr.getApprovedDate(), mr.getClosedDate()).toHours())
                .sum();
        return java.util.Map.of(
                "totalClosedRequests", closed.size(),
                "totalActualCost", totalActual,
                "totalEstimatedCost", totalEstimated,
                "totalDowntimeHours", totalDowntimeHours
        );
    }

    // ── Report: Cost Breakdown by Maintenance Type ──
    public java.util.Map<String, java.math.BigDecimal> getCostByMaintenanceType() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.CLOSED).stream()
                .filter(mr -> mr.getActualCost() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        mr -> mr.getMaintenanceType().name(),
                        java.util.stream.Collectors.reducing(
                                java.math.BigDecimal.ZERO,
                                MaintenanceRequest::getActualCost,
                                java.math.BigDecimal::add
                        )
                ));
    }

    // ── Report: Cost per Vehicle ──
    public java.util.List<java.util.Map<String, Object>> getCostPerVehicle() {
        return maintenanceRepository.findAll().stream()
                .filter(mr -> mr.getActualCost() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        mr -> mr.getVehicle().getId()
                ))
                .entrySet().stream()
                .map(entry -> {
                    var records = entry.getValue();
                    var first = records.get(0);
                    java.math.BigDecimal total = records.stream()
                            .map(MaintenanceRequest::getActualCost)
                            .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
                    return (java.util.Map<String, Object>) java.util.Map.<String, Object>of(
                            "vehicleId", first.getVehicle().getId(),
                            "plateNumber", first.getVehicle().getPlateNumber(),
                            "brandModel", first.getVehicle().getBrand() + " " + first.getVehicle().getModel(),
                            "totalMaintenanceCost", total,
                            "requestCount", records.size()
                    );
                })
                .toList();
    }

    // ── Mapper ──
    MaintenanceResponseDto mapToResponse(MaintenanceRequest mr) {
        Long downtimeHours = null;
        if (mr.getApprovedDate() != null && mr.getClosedDate() != null) {
            downtimeHours = Duration.between(mr.getApprovedDate(), mr.getClosedDate()).toHours();
        }

        return MaintenanceResponseDto.builder()
                .id(mr.getId())
                .vehicleId(mr.getVehicle().getId())
                .vehiclePlateNumber(mr.getVehicle().getPlateNumber())
                .vehicleBrandModel(mr.getVehicle().getBrand() + " " + mr.getVehicle().getModel())
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
