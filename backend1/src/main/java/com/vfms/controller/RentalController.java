package com.vfms.controller;

import com.vfms.entity.RentalRecord;
import com.vfms.service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
@CrossOrigin(origins = "http://localhost:3000")
public class RentalController {

    @Autowired
    private RentalService service;

    @GetMapping
    public List<RentalRecord> getRentals() {
        return service.getAllRentals();
    }

    @GetMapping("/revenue")
    public Double getRevenue() {
        return service.getTotalRevenue();
    }
}
