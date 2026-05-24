package com.vfms.dsm.controller;

import com.vfms.dsm.dto.ServiceRequestDto;
import com.vfms.dsm.entity.StaffServiceRequest;
import com.vfms.dsm.service.StaffServiceRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController @RequestMapping("/api/staff") @RequiredArgsConstructor
public class StaffServiceRequestController {
    private final StaffServiceRequestService requestService;

    @PostMapping("/service-requests")
    public ResponseEntity<StaffServiceRequest> create(@Valid @RequestBody ServiceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(dto));
    }

    @GetMapping("/{staffId}/service-requests")
    public ResponseEntity<List<StaffServiceRequest>> getByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(requestService.getRequestsByStaff(staffId));
    }

    @GetMapping("/service-requests/open")
    public ResponseEntity<List<StaffServiceRequest>> getOpen() {
        return ResponseEntity.ok(requestService.getOpenRequests());
    }

    @GetMapping("/service-requests/vehicle-ids")
    public ResponseEntity<List<Long>> getVehicleIds() {
        return ResponseEntity.ok(requestService.getVehicleIds());
    }

    @PatchMapping("/service-requests/{id}/status")
    public ResponseEntity<StaffServiceRequest> updateStatus(
            @PathVariable Long id, @RequestParam StaffServiceRequest.RequestStatus status) {
        return ResponseEntity.ok(requestService.updateStatus(id, status));
    }
}
