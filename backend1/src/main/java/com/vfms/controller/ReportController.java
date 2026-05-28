package com.vfms.controller;

import com.vfms.dto.*;
import com.vfms.service.ReportService;
import com.vfms.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportExportService reportExportService;

    @GetMapping("/export/{type}")
    public ResponseEntity<byte[]> exportReport(@PathVariable String type, @RequestParam String format)
            throws java.io.IOException {
        byte[] data = reportExportService.exportReport(type, format);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        String extension = "pdf".equalsIgnoreCase(format) ? "pdf" : "xlsx";
        headers.add("Content-Disposition", "attachment; filename=report-" + type + "." + extension);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/costs")
    public ResponseEntity<CostAnalysisDTO> getCostAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (startDate == null)
            startDate = LocalDate.now().minusMonths(1);
        if (endDate == null)
            endDate = LocalDate.now();

        return ResponseEntity.ok(reportService.getCostAnalysis(startDate, endDate));
    }

    @GetMapping("/utilization")
    public ResponseEntity<List<VehicleUtilizationDTO>> getVehicleUtilization() {
        return ResponseEntity.ok(reportService.getVehicleUtilization());
    }

    @GetMapping("/driver-performance")
    public ResponseEntity<List<DriverPerformanceDTO>> getDriverPerformance() {
        return ResponseEntity.ok(reportService.getDriverPerformance());
    }

    @GetMapping("/trips/stats")
    public ResponseEntity<TripStatsDTO> getTripStats() {
        return ResponseEntity.ok(reportService.getTripStats());
    }
}
