package com.vfms.dsm.controller;

import com.vfms.dsm.dto.EligibilityCheckRequest;
import com.vfms.dsm.dto.EligibilityCheckResponse;
import com.vfms.dsm.service.DriverEligibilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/internal/drivers", "/api/drivers"})
@RequiredArgsConstructor
public class DriverEligibilityController {
    private final DriverEligibilityService eligibilityService;

    @PostMapping("/eligibility")
    public ResponseEntity<EligibilityCheckResponse> checkEligibility(@Valid @RequestBody EligibilityCheckRequest request) {
        return ResponseEntity.ok(eligibilityService.checkEligibility(request));
    }

    @GetMapping("/eligibility")
    public ResponseEntity<EligibilityCheckResponse> checkEligibilityGet(
            @RequestParam String employeeId,
            @RequestParam String vehicleCategory,
            @RequestParam String tripDate) {
        EligibilityCheckRequest req = new EligibilityCheckRequest();
        req.setEmployeeId(employeeId);
        req.setVehicleCategory(vehicleCategory);
        req.setTripDate(LocalDate.parse(tripDate));
        return ResponseEntity.ok(eligibilityService.checkEligibility(req));
    }
}
