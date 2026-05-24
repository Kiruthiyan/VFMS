package com.vfms.dsm.controller;

import com.vfms.dsm.dto.QualificationCheckResponse;
import com.vfms.dsm.service.DriverQualificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController @RequestMapping("/api/drivers") @RequiredArgsConstructor
public class DriverQualificationController {
    private final DriverQualificationService qualificationService;

    @GetMapping("/{driverId}/qualification")
    public ResponseEntity<QualificationCheckResponse> checkQualification(
            @PathVariable UUID driverId,
            @RequestParam String vehicleCategory) {
        return ResponseEntity.ok(qualificationService.checkQualification(driverId, vehicleCategory));
    }
}
