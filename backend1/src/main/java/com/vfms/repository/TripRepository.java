package com.vfms.repository;

import com.vfms.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByStartDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Trip> findByVehicleId(Long vehicleId);

    List<Trip> findByDriverId(java.util.UUID driverId);
}
