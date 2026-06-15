package com.vfms.dsm.controller;

import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.dsm.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Read-only REST API for staff (users with SYSTEM_USER or APPROVER role).
 * Data is sourced from the `users` table. The legacy `staff` table is no longer used.
 */
@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> get(@PathVariable @NonNull UUID id) {
        return ResponseEntity.ok(staffService.getStaff(id));
    }

    @GetMapping
    public ResponseEntity<Page<UserSummaryResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(staffService.getAllStaff(PageRequest.of(page, size)));
    }
}
