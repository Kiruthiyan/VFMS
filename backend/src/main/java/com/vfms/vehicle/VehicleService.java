package com.vfms.vehicle;

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

    // ── Add Vehicle ──
    @Transactional
    public VehicleResponseDto addVehicle(VehicleRequestDto request) {
        if (vehicleRepository.existsByPlateNumber(request.getPlateNumber())) {
            throw new RuntimeException("Vehicle with plate number '"
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
    public VehicleResponseDto getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
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
                .active(v.getActive())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }
}
