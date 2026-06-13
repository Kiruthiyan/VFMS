package com.vfms.dsm.controller;

import com.vfms.dsm.dto.DriverServiceRequestDto;
import com.vfms.dsm.entity.DriverServiceRequest;
import com.vfms.dsm.service.DriverServiceRequestService;
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
public class DriverServiceRequestController {

    private final DriverServiceRequestService requestService;

    @PostMapping("/service-requests")
    public ResponseEntity<DriverServiceRequest> create(@Valid @RequestBody DriverServiceRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(dto));
    }

    @GetMapping("/{driverId}/service-requests")
    public ResponseEntity<List<DriverServiceRequest>> getByDriver(@PathVariable UUID driverId) {
        return ResponseEntity.ok(requestService.getRequestsByDriver(driverId));
    }

    @GetMapping("/service-requests/open")
    public ResponseEntity<List<DriverServiceRequest>> getOpen() {
        return ResponseEntity.ok(requestService.getOpenRequests());
    }

    @PatchMapping("/service-requests/{id}/status")
    public ResponseEntity<DriverServiceRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam DriverServiceRequest.RequestStatus status) {
        return ResponseEntity.ok(requestService.updateStatus(id, status));
    }
}