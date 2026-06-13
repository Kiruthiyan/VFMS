package com.vfms.dsm.service;

import com.vfms.dsm.entity.TripRequest;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.TripRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TripRequestService {

    private final TripRequestRepository tripRequestRepository;

    /**
     * Get all active trips for a specific driver
     */
    public List<TripRequest> getActiveTripsByDriver(UUID driverId) {
        return tripRequestRepository.findActiveTripsForDriver(driverId, LocalDateTime.now());
    }

    /**
     * Get trips for a driver, optionally filtered by status
     */
    public List<TripRequest> getTripsByDriver(UUID driverId, String status) {
        if (status != null && !status.isEmpty()) {
            try {
                TripRequest.TripStatus tripStatus = TripRequest.TripStatus.valueOf(status.toUpperCase());
                return tripRequestRepository.findByDriver_IdAndStatusOrderByDepartureTimeDesc(driverId, tripStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status: " + status);
            }
        }
        return tripRequestRepository.findByDriver_IdOrderByDepartureTimeDesc(driverId);
    }

    /**
     * Get a specific trip by ID
     */
    public TripRequest getTripById(UUID tripId) {
        return tripRequestRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found: " + tripId));
    }

    /**
     * Create a new trip request
     */
    public TripRequest createTrip(TripRequest tripRequest) {
        if (tripRequest.getStatus() == null) {
            tripRequest.setStatus(TripRequest.TripStatus.SCHEDULED);
        }
        return tripRequestRepository.save(tripRequest);
    }

    /**
     * Update an existing trip request
     */
    public TripRequest updateTrip(UUID tripId, TripRequest tripRequest) {
        TripRequest existingTrip = getTripById(tripId);
        
        if (tripRequest.getDepartureTime() != null) {
            existingTrip.setDepartureTime(tripRequest.getDepartureTime());
        }
        if (tripRequest.getCompletionTime() != null) {
            existingTrip.setCompletionTime(tripRequest.getCompletionTime());
        }
        if (tripRequest.getStatus() != null) {
            existingTrip.setStatus(tripRequest.getStatus());
        }
        if (tripRequest.getOrigin() != null) {
            existingTrip.setOrigin(tripRequest.getOrigin());
        }
        if (tripRequest.getDestination() != null) {
            existingTrip.setDestination(tripRequest.getDestination());
        }
        if (tripRequest.getVehicleId() != null) {
            existingTrip.setVehicleId(tripRequest.getVehicleId());
        }
        if (tripRequest.getNotes() != null) {
            existingTrip.setNotes(tripRequest.getNotes());
        }
        
        return tripRequestRepository.save(existingTrip);
    }

    /**
     * Complete a trip request
     */
    public TripRequest completeTrip(UUID tripId) {
        TripRequest trip = getTripById(tripId);
        trip.setStatus(TripRequest.TripStatus.COMPLETED);
        trip.setCompletionTime(LocalDateTime.now());
        return tripRequestRepository.save(trip);
    }

    /**
     * Cancel a trip request
     */
    public TripRequest cancelTrip(UUID tripId) {
        TripRequest trip = getTripById(tripId);
        trip.setStatus(TripRequest.TripStatus.CANCELLED);
        return tripRequestRepository.save(trip);
    }

    /**
     * Delete a trip request
     */
    public void deleteTrip(UUID tripId) {
        TripRequest trip = getTripById(tripId);
        tripRequestRepository.delete(trip);
    }

    /**
     * Find all active trips across all drivers
     */
    public List<TripRequest> getAllActiveTrips() {
        return tripRequestRepository.findAllActiveTrips(LocalDateTime.now());
    }
}
