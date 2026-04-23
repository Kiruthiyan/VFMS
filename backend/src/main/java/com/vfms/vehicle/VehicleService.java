package com.vfms.vehicle;

import com.vfms.vehicle.dto.VehicleRequestDto;
import com.vfms.vehicle.dto.VehicleResponseDto;
import com.vfms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    // ── Add Vehicle ──
    // Registers a new vehicle. We check for plate number uniqueness to prevent 
    // duplicate assets from corrupting the database and reporting metrics.
    @Transactional
    public VehicleResponseDto addVehicle(VehicleRequestDto request) {
        if (vehicleRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new IllegalArgumentException("Vehicle with plate number '"
                    + request.getPlateNumber() + "' already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .plateNumber(request.getPlateNumber())
                .brand(request.getBrand())
                .model(request.getModel())
                .year(request.getYear())
                .vehicleType(request.getVehicleType())
                .fuelType(request.getFuelType())
                .department(request.getDepartment())
                .color(request.getColor())
                .seatingCapacity(request.getSeatingCapacity())
                .insuranceExpiryDate(request.getInsuranceExpiryDate())
                .revenueLicenseExpiryDate(request.getRevenueLicenseExpiryDate())
                .build();

        return mapToResponse(vehicleRepository.save(vehicle));
    }

        // ── Get All Vehicles ──
    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findByActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }


    // ── Get Vehicles by Status ──
    public List<VehicleResponseDto> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatusAndActiveTrue(status)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── Get Vehicle by ID ──
    // Retrieves a vehicle by ID. Throws ResourceNotFoundException if it does not exist,
    // ensuring clients receive a proper 404 response instead of a 500 server error.
    public VehicleResponseDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        return mapToResponse(vehicle);
    }

    // ── Update Vehicle ──
    @Transactional
    public VehicleResponseDto updateVehicle(Long id, VehicleRequestDto request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        vehicle.setPlateNumber(request.getPlateNumber());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setDepartment(request.getDepartment());
        vehicle.setColor(request.getColor());
        vehicle.setSeatingCapacity(request.getSeatingCapacity());
        vehicle.setInsuranceExpiryDate(request.getInsuranceExpiryDate());
        vehicle.setRevenueLicenseExpiryDate(request.getRevenueLicenseExpiryDate());

        return mapToResponse(vehicleRepository.save(vehicle));
    }

    // ── Deactivate Vehicle ──
    // Soft delete instead of hard delete. This preserves the audit trail
    // and historical relationships (like maintenance records and rentals).
    @Transactional
    public VehicleResponseDto deactivateVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setActive(false);
        vehicle.setStatus(VehicleStatus.RETIRED);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    // ── Retire Vehicle ──
    // Retiring also performs a soft delete and marks the status explicitly.
    @Transactional
    public VehicleResponseDto retireVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setActive(false);
        vehicle.setStatus(VehicleStatus.RETIRED);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    // ── Update Vehicle Status ──
    @Transactional
    public VehicleResponseDto updateVehicleStatus(Long id, VehicleStatus newStatus) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setStatus(newStatus);
        return mapToResponse(vehicleRepository.save(vehicle));
    }

    // ── Mapper ──
    private VehicleResponseDto mapToResponse(Vehicle v) {
        return VehicleResponseDto.builder()
                .id(v.getId())
                .plateNumber(v.getPlateNumber())
                .brand(v.getBrand())
                .model(v.getModel())
                .year(v.getYear())
                .vehicleType(v.getVehicleType())
                .fuelType(v.getFuelType())
                .status(v.getStatus())
                .department(v.getDepartment())
                .color(v.getColor())
                .seatingCapacity(v.getSeatingCapacity())
                .insuranceExpiryDate(v.getInsuranceExpiryDate())
                .revenueLicenseExpiryDate(v.getRevenueLicenseExpiryDate())
                .active(v.getActive())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
