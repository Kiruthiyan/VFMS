package com.vfms.dsm.controller;

import com.vfms.dsm.entity.DriverPerformanceScore;
import com.vfms.dsm.service.DriverPerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverPerformanceController {

    private final DriverPerformanceService performanceService;

    @GetMapping("/{driverId}/performance-scores")
    public ResponseEntity<List<DriverPerformanceScore>> getScores(@PathVariable UUID driverId) {
        return ResponseEntity.ok(performanceService.getScoresByDriver(driverId));
    }
}
