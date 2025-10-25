package com.example.fuel.controller;

import com.example.fuel.entity.FuelRecord;
import com.example.fuel.repository.FuelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;





public class FuelController {

    @Autowired
    private FuelRepository fuelRepository;

    @GetMapping("/")
    public String showForm(Model model) {
        model.addAttribute("fuelRecord", new FuelRecord());
        return "fuel_form";
    }

    @PostMapping("/saveFuel")
    public String saveFuel(@ModelAttribute FuelRecord fuelRecord, Model model) {
        fuelRepository.save(fuelRecord);
        model.addAttribute("message", "Fuel record added successfully ✅");
        model.addAttribute("fuelRecord", new FuelRecord());
        return "fuel_form";
    }
}
