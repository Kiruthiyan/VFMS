package com.vfms.controller;

import com.vfms.entity.Vehicle;
import com.vfms.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "http://localhost:3000")
public class VehicleController {

    @Autowired
    private VehicleService service;

    @GetMapping
    public List<Vehicle> getVehicles() {
        return service.getAllVehicles();
    }

    @GetMapping("/total")
    public long getTotalVehicles() {
        return service.getVehicleCount();
    }

    @GetMapping("/total-distance")
    public Double getTotalDistance() {
        return service.getTotalFleetDistance();
    }
}
