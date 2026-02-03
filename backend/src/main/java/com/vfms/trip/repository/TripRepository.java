package com.vfms.trip.repository;

import com.vfms.trip.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import com.vfms.trip.model.TripStatus;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Integer> {
    List<Trip> findByDriverId(Integer driverId);
    List<Trip> findByRequesterId(Integer requesterId);
    List<Trip> findByStatus(TripStatus status);
}
