package com.vfms.trip.service;

import com.vfms.trip.model.Trip;
import com.vfms.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {
    private final TripRepository repository;

    public List<Trip> getAllTrips() {
        return repository.findAll();
    }

    public List<Trip> getTripsByDriver(Integer driverId) {
        return repository.findByDriverId(driverId);
    }

    public List<Trip> getTripsByRequester(Integer requesterId) {
        return repository.findByRequesterId(requesterId);
    }

    public List<Trip> getTripsByStatus(com.vfms.trip.model.TripStatus status) {
        return repository.findByStatus(status);
    }

    public Trip getTripById(Integer id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Trip not found"));
    }

    public Trip createTrip(Trip trip) {
        return repository.save(trip);
    }

    public Trip updateTrip(Integer id, Trip tripDetails) {
        Trip trip = getTripById(id);
        trip.setStartLocation(tripDetails.getStartLocation());
        trip.setEndLocation(tripDetails.getEndLocation());
        trip.setStartTime(tripDetails.getStartTime());
        trip.setEndTime(tripDetails.getEndTime());
        trip.setStatus(tripDetails.getStatus());
        trip.setDriver(tripDetails.getDriver());
        trip.setVehicle(tripDetails.getVehicle());
        trip.setDistance(tripDetails.getDistance());
        return repository.save(trip);
    }

    public void deleteTrip(Integer id) {
        repository.deleteById(id);
    }

    public Trip startTrip(Integer id) {
        Trip trip = getTripById(id);
        if (trip.getStatus() != com.vfms.trip.model.TripStatus.ASSIGNED) {
            throw new RuntimeException("Only ASSIGNED trips can be started");
        }
        trip.setStatus(com.vfms.trip.model.TripStatus.STARTED);
        trip.setStartTime(java.time.LocalDateTime.now());
        
        // Update vehicle status to IN_USE
        if (trip.getVehicle() != null) {
            trip.getVehicle().setStatus("IN_USE");
            // Set start odometer from current vehicle odometer
            trip.setStartOdometer(trip.getVehicle().getCurrentOdometer());
        }

        return repository.save(trip);
    }
    
    public Trip completeTrip(Integer id, com.vfms.trip.dto.TripCompletionRequest request) {
        Trip trip = getTripById(id);
         if (trip.getStatus() != com.vfms.trip.model.TripStatus.STARTED) {
            throw new RuntimeException("Only STARTED trips can be completed");
        }
        
        trip.setStatus(com.vfms.trip.model.TripStatus.COMPLETED);
        trip.setEndTime(java.time.LocalDateTime.now());
        trip.setEndOdometer(request.getEndOdometer());
        trip.setFuelConsumed(request.getFuelConsumed());
        trip.setNotes(request.getNotes());
        
        // Update vehicle details
        if (trip.getVehicle() != null) {
            trip.getVehicle().setStatus("AVAILABLE");
            trip.getVehicle().setCurrentOdometer(request.getEndOdometer());
            // Could also update fuel level logic here if we had tank capacity
        }
        
        return repository.save(trip);
    }
}
