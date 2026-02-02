package com.example.vehicleapi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
public class FuelReportController {

    @GetMapping("/api/reports/fuel-monthly")
    public List<Map<String, Object>> getMonthlyFuelReport() {
        List<Map<String, Object>> fuelReports = new ArrayList<>();

         
        Map<String, Object> jan = new HashMap<>();
        jan.put("month", "January");
        jan.put("fuelCost", 15000);
        jan.put("litresUsed", 320);

        Map<String, Object> feb = new HashMap<>();
        feb.put("month", "February");
        feb.put("fuelCost", 12800);
        feb.put("litresUsed", 290);

        Map<String, Object> mar = new HashMap<>();
        mar.put("month", "March");
        mar.put("fuelCost", 16500);
        mar.put("litresUsed", 350);

        Map<String, Object> apr = new HashMap<>();
        apr.put("month", "April");
        apr.put("fuelCost", 14200);
        apr.put("litresUsed", 310);

        fuelReports.add(jan);
        fuelReports.add(feb);
        fuelReports.add(mar);
        fuelReports.add(apr);

        return fuelReports; 
    }
}
