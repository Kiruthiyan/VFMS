package com.vfms.dsm.controller;

import com.vfms.dsm.dto.*;
import com.vfms.dsm.service.StaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/staff") @RequiredArgsConstructor
public class StaffController {
    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<StaffResponse> create(@NonNull @Valid @RequestBody StaffRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(staffService.createStaff(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> get(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(staffService.getStaff(id));
    }

    @GetMapping
    public ResponseEntity<Page<StaffResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(staffService.getAllStaff(PageRequest.of(page, size)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> update(@PathVariable @NonNull Long id, @NonNull @Valid @RequestBody StaffRequest req) {
        return ResponseEntity.ok(staffService.updateStaff(id, req));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivate(@PathVariable @NonNull Long id) {
        staffService.deactivateStaff(id);
        return ResponseEntity.noContent().build();
    }
}
