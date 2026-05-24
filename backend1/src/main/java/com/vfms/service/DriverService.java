package com.vfms.service;

import com.vfms.entity.Driver;
import com.vfms.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class DriverService {

    @Autowired
    private DriverRepository repo;

    public List<Driver> getAllDrivers() {
        return repo.findAll();
    }

    public Double getAvgPerformance() {
        Double avg = repo.getAveragePerformance();
        return avg != null ? avg : 0.0;
    }

    public List<Driver> getDriversByStatus(String status) {
        return repo.findByLicenseStatus(status);
    }

    // New methods for Analytics (Live Data)

    public List<Map<String, Object>> getInfractions() {
        List<Driver> drivers = repo.findAll();
        // Since we don't have a separate infraction table yet, 
        // we'll return the list of drivers who have infractions > 0
        return drivers.stream()
                .filter(d -> d.getInfractions() != null && d.getInfractions() > 0)
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("driverName", d.getName());
                    map.put("name", d.getName());
                    map.put("type", "General Violation");
                    map.put("date", d.getJoiningDate() != null ? d.getJoiningDate().toString() : "N/A");
                    map.put("severity", d.getInfractions() > 5 ? "High" : (d.getInfractions() > 2 ? "Medium" : "Low"));
                    map.put("points", d.getInfractions() * 2);
                    map.put("status", "Resolved");
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCompliance() {
        List<Driver> drivers = repo.findAll();
        return drivers.stream()
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("driverName", d.getName());
                    map.put("licenseStatus", d.getLicenseStatus());
                    map.put("rating", d.getRating());
                    map.put("complianceStatus", "VALID".equals(d.getLicenseStatus()) ? "Compliant" : "Non-Compliant");
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getReadiness() {
        List<Driver> drivers = repo.findAll();
        return drivers.stream()
                .map(d -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", d.getId());
                    map.put("name", d.getName());
                    map.put("status", "Available");
                    map.put("nextTrip", "Unassigned");
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getLeaves() {
        // Return empty for now as we don't have a leaves table
        return new java.util.ArrayList<>();
    }
}
