package com.vfms.dsm.service;

import com.vfms.dsm.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public List<Long> getVehicleIds() {
        return vehicleRepository.findAllByOrderByIdDesc().stream()
                .map(vehicle -> vehicle.getId())
                .toList();
    }
}