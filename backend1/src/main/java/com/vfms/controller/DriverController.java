package com.vfms.controller;

import com.vfms.entity.Driver;
import com.vfms.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "http://localhost:3000")
public class DriverController {

    @Autowired
    private DriverService service;

    @GetMapping
    public List<Driver> getDrivers() {
        return service.getAllDrivers();
    }

    @GetMapping("/performance/average")
    public Double getAvgPerformance() {
        return service.getAvgPerformance();
    }

    @GetMapping("/infractions")
    public List<Map<String, Object>> getInfractions() {
        return service.getInfractions();
    }

    @GetMapping("/compliance")
    public List<Map<String, Object>> getCompliance() {
        return service.getCompliance();
    }

    @GetMapping("/readiness")
    public List<Map<String, Object>> getReadiness() {
        return service.getReadiness();
    }

    @GetMapping("/leaves")
    public List<Map<String, Object>> getLeaves() {
        return service.getLeaves();
    }
}
