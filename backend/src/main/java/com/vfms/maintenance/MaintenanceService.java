package com.vfms.maintenance;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.maintenance.dto.MaintenanceRequestDto;
import com.vfms.maintenance.dto.MaintenanceResponseDto;
import com.vfms.vehicle.Vehicle;
import com.vfms.vehicle.VehicleRepository;
import com.vfms.vehicle.VehicleStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional
    public MaintenanceResponseDto createRequest(MaintenanceRequestDto request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        MaintenanceRequest mr = MaintenanceRequest.builder()
                .vehicle(vehicle)
                .maintenanceType(request.getMaintenanceType())
                .description(request.getDescription())
                .estimatedCost(request.getEstimatedCost())
                .build();

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Edits are blocked once a request leaves NEW status so that the details seen by the approver cannot be altered after submission
    @Transactional
    public MaintenanceResponseDto updateRequest(Long id, MaintenanceRequestDto request) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new IllegalStateException("Can only edit requests in NEW status");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", request.getVehicleId()));

        mr.setVehicle(vehicle);
        mr.setMaintenanceType(request.getMaintenanceType());
        mr.setDescription(request.getDescription());
        mr.setEstimatedCost(request.getEstimatedCost());

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Transitioning to SUBMITTED locks the request from further edits and places it in the approver queue as a distinct, reviewable snapshot
    @Transactional
    public MaintenanceResponseDto submitRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.NEW) {
            throw new IllegalStateException("Can only submit requests in NEW status");
        }

        mr.setStatus(MaintenanceStatus.SUBMITTED);

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Changed at approval so the scheduling layer immediately knows the vehicle is unavailable
    @Transactional
    public MaintenanceResponseDto approveRequest(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new IllegalStateException("Can only approve SUBMITTED requests");
        }
        if (mr.getVehicle().getStatus() == VehicleStatus.RETIRED) {
            throw new IllegalStateException("Cannot approve maintenance for a retired vehicle.");
        }

        mr.setStatus(MaintenanceStatus.APPROVED);
        mr.setApprovedDate(LocalDateTime.now());
        mr.getVehicle().setStatus(VehicleStatus.UNDER_MAINTENANCE);

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Rejection reason is persisted rather than discarded so there is a traceable record if the same request is disputed or resubmitted later
    @Transactional
    public MaintenanceResponseDto rejectRequest(Long id, String reason) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.SUBMITTED) {
            throw new IllegalStateException("Can only reject SUBMITTED requests");
        }

        mr.setStatus(MaintenanceStatus.REJECTED);
        mr.setRejectionReason(reason);

        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Only rolled back for APPROVED requests since REJECTED ones never triggered the transition
    @Transactional
    public MaintenanceResponseDto closeRequest(Long id, BigDecimal actualCost) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        MaintenanceStatus originalStatus = mr.getStatus();

        if (originalStatus != MaintenanceStatus.APPROVED && originalStatus != MaintenanceStatus.REJECTED) {
            throw new IllegalStateException("Can only close APPROVED or REJECTED requests");
        }

        mr.setClosedDate(LocalDateTime.now());
        mr.setActualCost(actualCost);
        mr.setStatus(MaintenanceStatus.CLOSED);

        if (originalStatus == MaintenanceStatus.APPROVED) {
            mr.getVehicle().setStatus(VehicleStatus.AVAILABLE);
        }

        return mapToResponse(maintenanceRepository.save(mr));
    }

    public List<MaintenanceResponseDto> getAllRequests() {
        return maintenanceRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MaintenanceResponseDto> getRequestsByStatus(MaintenanceStatus status) {
        return maintenanceRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<MaintenanceResponseDto> getRequestsByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public MaintenanceResponseDto getRequestById(Long id) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));
        return mapToResponse(mr);
    }

    @Transactional
    public MaintenanceResponseDto uploadQuotation(Long id, String quotationUrl) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));
        mr.setQuotationUrl(quotationUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Invoice upload is restricted to APPROVED and CLOSED requests because an invoice without approved work has no financial standing in the audit trail
    @Transactional
    public MaintenanceResponseDto uploadInvoice(Long id, String invoiceUrl) {
        MaintenanceRequest mr = maintenanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", id));

        if (mr.getStatus() != MaintenanceStatus.APPROVED && mr.getStatus() != MaintenanceStatus.CLOSED) {
            throw new IllegalStateException("Invoice can only be uploaded for approved/closed requests");
        }

        mr.setInvoiceUrl(invoiceUrl);
        return mapToResponse(maintenanceRepository.save(mr));
    }

    // Only records with both dates present are included so that downtime hours can be calculated accurately — partial records would skew the report
    public List<MaintenanceResponseDto> getDowntimeByVehicle(Long vehicleId) {
        return maintenanceRepository.findByVehicleId(vehicleId).stream()
                .filter(mr -> mr.getApprovedDate() != null && mr.getClosedDate() != null)
                .map(this::mapToResponse)
                .toList();
    }

    public List<MaintenanceResponseDto> getPendingApprovals() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.SUBMITTED).stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Summary is built from CLOSED records only so that in-progress estimates do not inflate the reported actual spend figures
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
                .mapToLong(mr -> Duration.between(mr.getApprovedDate(), mr.getClosedDate()).toHours())
                .sum();

        return Map.of(
                "totalClosedRequests", closed.size(),
                "totalActualCost", totalActual,
                "totalEstimatedCost", totalEstimated,
                "totalDowntimeHours", totalDowntimeHours);
    }

    public Map<String, BigDecimal> getCostByMaintenanceType() {
        return maintenanceRepository.findByStatus(MaintenanceStatus.CLOSED).stream()
                .filter(mr -> mr.getActualCost() != null)
                .collect(Collectors.groupingBy(
                        mr -> mr.getMaintenanceType().name(),
                        Collectors.reducing(BigDecimal.ZERO, MaintenanceRequest::getActualCost, BigDecimal::add)));
    }

    // Includes all records so partial costs from still-open work are not excluded from fleet spend
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
                            "brandModel", first.getVehicle().getBrand() + " " + first.getVehicle().getModel(),
                            "totalMaintenanceCost", total,
                            "requestCount", records.size());
                })
                .toList();
    }

    MaintenanceResponseDto mapToResponse(MaintenanceRequest mr) {
        // Null rather than zero so callers can distinguish "not yet finished" from "zero hours"
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