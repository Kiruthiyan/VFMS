package com.vfms.dsm.controller;

import com.vfms.dsm.dto.CertificationRequest;
import com.vfms.dsm.entity.DriverCertification;
import com.vfms.dsm.service.DriverCertificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverCertificationController {
    private final DriverCertificationService certService;

    @PostMapping("/{driverId}/certifications")
    public ResponseEntity<DriverCertification> add(@PathVariable UUID driverId, @Valid @RequestBody CertificationRequest request) {
        request.setDriverId(driverId);
        return ResponseEntity.status(HttpStatus.CREATED).body(certService.addCertification(request));
    }

    @GetMapping("/{driverId}/certifications")
    public ResponseEntity<List<DriverCertification>> get(@PathVariable UUID driverId) {
        return ResponseEntity.ok(certService.getCertificationsByDriver(driverId));
    }

    @PutMapping("/certifications/{id}")
    public ResponseEntity<DriverCertification> update(@PathVariable Long id, @Valid @RequestBody CertificationRequest request) {
        return ResponseEntity.ok(certService.updateCertification(id, request));
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certService.deleteCertification(id);
        return ResponseEntity.noContent().build();
    }
}
