package com.vfms.trip.repository;

import com.vfms.trip.entity.TripRequest;
import com.vfms.trip.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TripRequestRepository extends JpaRepository<TripRequest, UUID> {

    @Query("SELECT t FROM TripRequest t WHERE t.assignedDriverId = :driverId " +
            "AND t.departureTime <= :now " +
            "AND t.endTime IS NULL " +
            "AND t.status IN ('APPROVED', 'DRIVER_CONFIRMED', 'ONGOING')")
    List<TripRequest> findActiveTripsForDriver(@Param("driverId") UUID driverId, @Param("now") LocalDateTime now);

    default Optional<TripRequest> findActiveTrip(UUID driverId, LocalDateTime now) {
        return findActiveTripsForDriver(driverId, now).stream().findFirst();
    }

    List<TripRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    List<TripRequest> findByStatusOrderByCreatedAtDesc(TripStatus status);

    List<TripRequest> findByAssignedDriverIdOrderByDepartureTimeAsc(UUID driverId);

    List<TripRequest> findByAssignedDriverIdAndStatusOrderByDepartureTimeAsc(
            UUID driverId, TripStatus status);

    List<TripRequest> findByRequesterIdAndStatusInOrderByDepartureTimeAsc(
            UUID requesterId, List<TripStatus> statuses);

    List<TripRequest> findByDepartureTimeBetweenOrderByDepartureTimeAsc(
            LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM TripRequest t WHERE t.assignedVehicleId = :vehicleId " +
            "AND t.status IN ('APPROVED', 'ONGOING') " +
            "AND t.departureTime < :returnTime " +
            "AND t.returnTime > :departureTime")
    List<TripRequest> findConflictingVehicleBookings(
            @Param("vehicleId") Long vehicleId,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("returnTime") LocalDateTime returnTime);

    @Query("SELECT t FROM TripRequest t WHERE t.assignedDriverId = :driverId " +
            "AND t.status IN ('APPROVED', 'ONGOING') " +
            "AND t.departureTime < :returnTime " +
            "AND t.returnTime > :departureTime")
    List<TripRequest> findConflictingDriverBookings(
            @Param("driverId") UUID driverId,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("returnTime") LocalDateTime returnTime);
}
