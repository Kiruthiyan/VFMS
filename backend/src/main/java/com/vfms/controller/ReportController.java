package com.vfms.controller;

import com.vfms.dto.*;
import com.vfms.entity.ReportDocument;
import com.vfms.repository.ReportDocumentRepository;
import com.vfms.service.ReportService;
import com.vfms.service.ReportSupabaseStorageService;
import com.vfms.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportDocumentRepository reportDocumentRepository;
    private final ReportSupabaseStorageService reportSupabaseStorageService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(reportService.getDashboardStats());
    }

    @GetMapping("/costs")
    public ResponseEntity<CostAnalysisDTO> getCostAnalysis(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusMonths(1);
        if (endDate == null) endDate = LocalDate.now();
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

    @GetMapping("/utilization/summary")
    public ResponseEntity<List<VehicleUtilizationDTO>> getUtilizationSummary() {
        return ResponseEntity.ok(reportService.getVehicleUtilization());
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReportDocument> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reportType") String reportType,
            @RequestParam("format") String format,
            @RequestParam(value = "fileName", required = false) String fileName) {

        String originalName = file.getOriginalFilename() == null ? "report" : file.getOriginalFilename();
        String displayName = (fileName == null || fileName.isBlank()) ? originalName : fileName;

        String path = reportSupabaseStorageService.uploadReportFile(reportType, format, file);

        ReportDocument doc = ReportDocument.builder()
                .fileName(displayName)
                .originalFileName(originalName)
                .bucketName(reportSupabaseStorageService.getBucketName())
                .storagePath(path)
                .mimeType(file.getContentType())
                .fileSize(file.getSize())
                .reportType(reportType)
                .format(format)
                .build();

        doc = reportDocumentRepository.save(doc);

        try {
            doc.setFileUrl(reportSupabaseStorageService.createSignedUrl(doc.getBucketName(), doc.getStoragePath()));
        } catch (Exception e) {
            // Keep fileUrl null or fallback
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(doc);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<ReportDocument>> getReportDocuments() {
        List<ReportDocument> docs = reportDocumentRepository.findAll();
        for (ReportDocument doc : docs) {
            try {
                doc.setFileUrl(reportSupabaseStorageService.createSignedUrl(doc.getBucketName(), doc.getStoragePath()));
            } catch (Exception e) {
                // Keep fileUrl null if sign fails
            }
        }
        return ResponseEntity.ok(docs);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> deleteReportDocument(@PathVariable Long id) {
        ReportDocument doc = reportDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report document not found: " + id));
        reportSupabaseStorageService.deleteObjectQuietly(doc.getBucketName(), doc.getStoragePath());
        reportDocumentRepository.delete(doc);
        return ResponseEntity.noContent().build();
    }
}
