package trip_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.service.TripRequestService;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripRequestController {

    private final TripRequestService service;

    @PostMapping
    public ResponseEntity<TripRequest> createTrip(@Valid @RequestBody CreateTripRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createTrip(dto));
    }
}