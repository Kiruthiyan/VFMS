package com.vfms.dsm.controller;

import com.vfms.dsm.dto.DriverComplianceResponse;
import com.vfms.dsm.service.DriverComplianceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
public class DriverComplianceController {

    private final DriverComplianceService complianceService;

    @GetMapping("/compliance")
    public ResponseEntity<List<DriverComplianceResponse>> getCompliance() {
        return ResponseEntity.ok(complianceService.getFleetCompliance());
    }
}
