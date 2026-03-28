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

        if (mr.getStatus() != MaintenanceStatus.APPROVED) {
            throw new RuntimeException("Can only close APPROVED requests");
        }

        mr.setStatus(MaintenanceStatus.CLOSED);
        mr.setClosedDate(java.time.LocalDateTime.now());
        mr.setActualCost(actualCost);

        // Auto-change vehicle status back to AVAILABLE
        mr.getVehicle().setStatus(com.vfms.vehicle.VehicleStatus.AVAILABLE);

        return mapToResponse(maintenanceRepository.save(mr));
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
