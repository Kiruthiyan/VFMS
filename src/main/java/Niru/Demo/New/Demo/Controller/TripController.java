package Niru.Demo.New.Demo.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;
import Niru.Demo.New.Demo.model.Trip;

@RestController
@RequestMapping("/api/trips")
@CrossOrigin(origins = "http://localhost:3000")  // allow frontend to connect
public class TripController {

    @GetMapping
    public List<Trip> getAllTrips() {
        List<Trip> trips = new ArrayList<>();
        trips.add(new Trip(1L, "Colombo → Kandy", "2025-10-12"));
        trips.add(new Trip(2L, "Jaffna → Trincomalee", "2025-10-15"));
        trips.add(new Trip(3L, "Galle → Matara", "2025-10-18"));
        return trips;
    }
}
