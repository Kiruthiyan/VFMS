package trip_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TripRequestRepository extends JpaRepository<TripRequest, UUID> {

    // Get all trips by a specific requester
    List<TripRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    // Get all trips by status
    List<TripRequest> findByStatusOrderByCreatedAtDesc(TripStatus status);

    // Get all trips assigned to a driver
    List<TripRequest> findByAssignedDriverIdOrderByDepartureTimeAsc(UUID driverId);

    List<TripRequest> findByAssignedDriverIdAndStatusOrderByDepartureTimeAsc(
            UUID driverId, TripStatus status);

    List<TripRequest> findByRequesterIdAndStatusInOrderByDepartureTimeAsc(
            UUID requesterId, List<TripStatus> statuses);

    // Check for vehicle double booking
    @Query("SELECT t FROM TripRequest t WHERE t.assignedVehicleId = :vehicleId " +
            "AND t.status IN ('APPROVED', 'ONGOING') " +
            "AND t.departureTime < :returnTime " +
            "AND t.returnTime > :departureTime")
    List<TripRequest> findConflictingVehicleBookings(
            @Param("vehicleId") UUID vehicleId,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("returnTime") LocalDateTime returnTime);

    // Check for driver double booking
    @Query("SELECT t FROM TripRequest t WHERE t.assignedDriverId = :driverId " +
            "AND t.status IN ('APPROVED', 'ONGOING') " +
            "AND t.departureTime < :returnTime " +
            "AND t.returnTime > :departureTime")
    List<TripRequest> findConflictingDriverBookings(
            @Param("driverId") UUID driverId,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("returnTime") LocalDateTime returnTime);
}