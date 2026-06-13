package com.vfms.service;

import com.vfms.entity.Vehicle;
import com.vfms.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleService {

    @Autowired
    private VehicleRepository repo;

    public List<Vehicle> getAllVehicles() {
        return repo.findAll();
    }

    public long getVehicleCount() {
        return repo.getTotalVehicles();
    }

    public Double getTotalFleetDistance() {
        return repo.getTotalFleetDistance();
    }
}
