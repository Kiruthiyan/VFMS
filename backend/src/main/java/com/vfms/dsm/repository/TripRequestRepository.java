package com.vfms.dsm.repository;

import com.vfms.dsm.entity.TripRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TripRequestRepository extends JpaRepository<TripRequest, UUID> {

    /**
     * Find active trips for a driver (departed but not completed)
     */
    @Query(nativeQuery = true, value = """
        SELECT * FROM trip_requests 
        WHERE driver_id = :driverId 
        AND departure_time <= :now 
        AND completion_time IS NULL 
        AND status IN ('SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS')
        ORDER BY departure_time DESC
    """)
    List<TripRequest> findActiveTripsForDriver(@Param("driverId") UUID driverId, @Param("now") LocalDateTime now);

    /**
     * Find the most recent active trip for a driver
     */
    default Optional<TripRequest> findActiveTrip(UUID driverId, LocalDateTime now) {
        return findActiveTripsForDriver(driverId, now).stream().findFirst();
    }

    /**
     * Find trips for a driver by status
     */
    List<TripRequest> findByDriver_IdAndStatusOrderByDepartureTimeDesc(UUID driverId, TripRequest.TripStatus status);

    /**
     * Find all trips for a driver
     */
    List<TripRequest> findByDriver_IdOrderByDepartureTimeDesc(UUID driverId);

    /**
     * Find all trips that have departed but not completed
     */
    @Query(nativeQuery = true, value = """
        SELECT * FROM trip_requests 
        WHERE departure_time <= :now 
        AND completion_time IS NULL 
        AND status IN ('SCHEDULED', 'DRIVER_CONFIRMED', 'IN_PROGRESS')
        ORDER BY departure_time DESC
    """)
    List<TripRequest> findAllActiveTrips(@Param("now") LocalDateTime now);
}
