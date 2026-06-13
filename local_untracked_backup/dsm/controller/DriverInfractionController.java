package com.vfms.dsm.controller;

import com.vfms.dsm.dto.InfractionRequest;
import com.vfms.dsm.entity.DriverInfraction;
import com.vfms.dsm.service.DriverInfractionService;
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
public class DriverInfractionController {

    private final DriverInfractionService infractionService;

    @PostMapping("/infractions")
    public ResponseEntity<DriverInfraction> log(@Valid @RequestBody InfractionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(infractionService.logInfraction(request));
    }

    @GetMapping("/{driverId}/infractions")
    public ResponseEntity<List<DriverInfraction>> get(@PathVariable UUID driverId) {
        return ResponseEntity.ok(infractionService.getInfractionsByDriver(driverId));
    }

    @PatchMapping("/infractions/{id}/resolve")
    public ResponseEntity<DriverInfraction> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(infractionService.resolveInfraction(id));
    }
}
