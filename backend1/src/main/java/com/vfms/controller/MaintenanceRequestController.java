package com.vfms.controller;

import com.vfms.entity.MaintenanceRequest;
import com.vfms.service.MaintenanceRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "http://localhost:3000")
public class MaintenanceRequestController {

    @Autowired
    private MaintenanceRequestService service;

    @GetMapping("/requests")
    public List<MaintenanceRequest> getRequests() {
        return service.getAllRequests();
    }

    @GetMapping("/total-cost")
    public Double getTotalCost() {
        return service.getTotalCost();
    }

    @GetMapping("/total-downtime")
    public Integer getTotalDowntime() {
        return service.getTotalDowntime();
    }
}
