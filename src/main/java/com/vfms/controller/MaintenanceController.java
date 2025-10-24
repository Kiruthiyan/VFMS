package com.vfms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MaintenanceController {

    @GetMapping("/")
    public String home() {
        return "Welcome to Vehicle Maintenance System!";
    }
}
