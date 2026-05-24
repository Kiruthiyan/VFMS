package com.vfms.vehicle;

import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.vehicle.dto.VehicleRequestDto;
import com.vfms.vehicle.dto.VehicleResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    // Checked in code rather than relying on the DB constraint to give callers a descriptive error
    @Transactional
    public VehicleResponseDto addVehicle(VehicleRequestDto request) {
        if (vehicleRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new IllegalArgumentException(
                    "Vehicle with plate number '" + request.getPlateNumber() + "' already exists");
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

    // Filters by active=true so retired vehicles are excluded from normal listings without requiring callers to pass an explicit filter
    public List<VehicleResponseDto> getAllVehicles() {
        return vehicleRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Combines status and active filters so retired vehicles never surface even when querying a specific status
    public List<VehicleResponseDto> getVehiclesByStatus(VehicleStatus status) {
        return vehicleRepository.findByStatusAndActiveTrue(status).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public VehicleResponseDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        return mapToResponse(vehicle);
    }

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

    // Both flags set together so the vehicle is excluded regardless of which filter is applied
    @Transactional
    public VehicleResponseDto retireVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        vehicle.setActive(false);
        vehicle.setStatus(VehicleStatus.RETIRED);

        return mapToResponse(vehicleRepository.save(vehicle));
    }

    @Transactional
    public VehicleResponseDto updateVehicleStatus(Long id, VehicleStatus newStatus) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        vehicle.setStatus(newStatus);

        return mapToResponse(vehicleRepository.save(vehicle));
    }

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