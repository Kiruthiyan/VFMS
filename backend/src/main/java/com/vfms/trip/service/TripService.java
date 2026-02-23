package com.vfms.trip.service;

import com.vfms.exception.ResourceNotFoundException;
import com.vfms.trip.model.Trip;
import com.vfms.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository repository;

    public List<Trip> getAllTrips() {
        return repository.findAll();
    }

    public List<Trip> getTripsByDriverEmail(String email) {
        return repository.findByDriverEmail(email);
    }

    public Trip createTrip(Trip trip) {
        trip.setCreatedAt(LocalDateTime.now());
        if (trip.getStatus() == null) {
            trip.setStatus("PENDING");
        }
        return repository.save(trip);
    }

    public Trip updateTripStatus(Long id, String status) {
        Trip trip = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        trip.setStatus(status);

        if ("IN_PROGRESS".equals(status) && trip.getStartTime() == null) {
            trip.setStartTime(LocalDateTime.now());
        } else if ("COMPLETED".equals(status) && trip.getEndTime() == null) {
            trip.setEndTime(LocalDateTime.now());
        }

        return repository.save(trip);
    }
}
