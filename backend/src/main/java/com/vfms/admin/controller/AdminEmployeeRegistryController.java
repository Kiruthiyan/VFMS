package com.vfms.admin.controller;

import com.vfms.admin.dto.CreateEmployeeRegistryRequest;
import com.vfms.admin.dto.EmployeeRegistrySummaryResponse;
import com.vfms.admin.service.AdminEmployeeRegistryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/employee-registry")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmployeeRegistryController {

    private final AdminEmployeeRegistryService adminEmployeeRegistryService;

    @GetMapping
    public ResponseEntity<List<EmployeeRegistrySummaryResponse>> getAllRecords() {
        return ResponseEntity.ok(adminEmployeeRegistryService.getAllRecords());
    }

    @PostMapping
    public ResponseEntity<EmployeeRegistrySummaryResponse> createRecord(
            @Valid @RequestBody CreateEmployeeRegistryRequest request) {
        EmployeeRegistrySummaryResponse created = adminEmployeeRegistryService.createRecord(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
