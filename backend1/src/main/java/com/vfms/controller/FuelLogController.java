package com.vfms.controller;

import com.vfms.entity.FuelLog;
import com.vfms.service.FuelLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
@CrossOrigin(origins = "http://localhost:3000")
public class FuelLogController {

    @Autowired
    private FuelLogService service;

    @GetMapping("/logs")
    public List<FuelLog> getLogs() {
        return service.getAllLogs();
    }

    @GetMapping("/total-spend")
    public Double getTotalSpend() {
        return service.getTotalSpend();
    }

    @GetMapping("/total-consumption")
    public Double getTotalConsumption() {
        return service.getTotalConsumption();
    }
}
