package com.vfms.dsm.controller;

import com.vfms.dsm.dto.LeaveApprovalRequest;
import com.vfms.dsm.dto.LeaveRequest;
import com.vfms.dsm.entity.DriverLeave;
import com.vfms.dsm.service.DriverLeaveService;
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
public class DriverLeaveController {

    private final DriverLeaveService leaveService;

    @PostMapping("/leaves")
    public ResponseEntity<DriverLeave> requestLeave(@Valid @RequestBody LeaveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leaveService.requestLeave(request));
    }

    @PatchMapping("/leaves/{leaveId}/process")
    public ResponseEntity<DriverLeave> processLeave(
            @PathVariable Long leaveId,
            @Valid @RequestBody LeaveApprovalRequest request,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(leaveService.processLeave(leaveId, request, userId));
    }

    @GetMapping("/{driverId}/leaves")
    public ResponseEntity<List<DriverLeave>> getLeavesByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(leaveService.getLeavesByDriver(driverId));
    }

    @GetMapping("/leaves/pending")
    public ResponseEntity<List<DriverLeave>> getPendingLeaves() {
        return ResponseEntity.ok(leaveService.getPendingLeaves());
    }
}
