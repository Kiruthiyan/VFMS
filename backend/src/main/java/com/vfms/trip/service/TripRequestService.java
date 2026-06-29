package com.vfms.trip.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.vfms.trip.dto.CreateTripRequestDTO;
import com.vfms.trip.entity.TripRequest;
import com.vfms.trip.enums.TripStatus;
import com.vfms.trip.repository.TripRequestRepository;
import java.util.List;
import java.util.UUID;
import com.vfms.trip.dto.ApprovalDTO;
import java.time.LocalDateTime;
import com.vfms.trip.dto.VehicleOptionDTO;
import com.vfms.trip.dto.DriverOptionDTO;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.common.exception.ValidationException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

// Core business logic for managing the lifecycle of trip requests, including scheduling, approvals, and resource assignment.
@Service
@RequiredArgsConstructor
public class TripRequestService {

    @PersistenceContext
    private EntityManager entityManager;
    private final TripRequestRepository repository;

    public TripRequest createTrip(CreateTripRequestDTO dto) {
        // Validate that the trip spans a valid, logical time window
        if (dto.getReturnTime().isBefore(dto.getDepartureTime()) ||
                dto.getReturnTime().isEqual(dto.getDepartureTime())) {
            throw new ValidationException("Return time must be after departure time");
        }
        TripRequest trip = TripRequest.builder()
                .requesterId(dto.getRequesterId())
                .purpose(dto.getPurpose())
                .destination(dto.getDestination())
                .departureTime(dto.getDepartureTime())
                .returnTime(dto.getReturnTime())
                .passengerCount(dto.getPassengerCount())
                .distanceKm(dto.getDistanceKm())
                .status(TripStatus.NEW)
                .build();
        return repository.save(trip);
    }

    public List<TripRequest> getAllTrips() {
        return repository.findAll();
    }

    public List<TripRequest> getTripsByStatus(TripStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    // Using native SQL queries here to efficiently fetch lightweight DTOs directly from cross-domain tables
    @SuppressWarnings("unchecked")
    public List<VehicleOptionDTO> getAvailableVehicles() {
        List<Object[]> rows1 = entityManager.createNativeQuery(
                "SELECT id, brand, model, plate_number FROM vehicles WHERE status = 'AVAILABLE'"
        ).getResultList();

        List<Object[]> rows2 = entityManager.createNativeQuery(
                "SELECT id, vehicle_type as brand, '' as model, plate_number FROM rental_records WHERE status = 'ACTIVE'"
        ).getResultList();

        List<VehicleOptionDTO> list = new java.util.ArrayList<>();
        for (Object[] row : rows1) {
            list.add(new VehicleOptionDTO(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    (String) row[3]
            ));
        }
        for (Object[] row : rows2) {
            list.add(new VehicleOptionDTO(
                    ((Number) row[0]).longValue() + 100000000L,
                    (String) row[1],
                    (String) row[2],
                    (String) row[3]
            ));
        }
        return list;
    }

    @SuppressWarnings("unchecked")
    public List<DriverOptionDTO> getAvailableDrivers() {
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT id::text, first_name, last_name, employee_id FROM drivers " +
                "WHERE readiness_license_valid = true"
        ).getResultList();

        return rows.stream().map(row -> new DriverOptionDTO(
                (String) row[0],
                (String) row[1],
                (String) row[2],
                (String) row[3]
        )).toList();
    }

    @SuppressWarnings("unchecked")
    public List<DriverOptionDTO> getAllDrivers() {
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT id::text, first_name, last_name, employee_id FROM drivers ORDER BY first_name"
        ).getResultList();

        return rows.stream().map(row -> new DriverOptionDTO(
                (String) row[0],
                (String) row[1],
                (String) row[2],
                (String) row[3]
        )).toList();
    }

    public TripRequest getTripById(UUID tripId) {
        return findById(tripId);
    }

    public List<TripRequest> getTripsByRequester(UUID requesterId) {
        return repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    private TripRequest findById(UUID id) {
        TripRequest trip = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        // Auto-expire check during lookup
        if ((trip.getStatus() == TripStatus.APPROVED || trip.getStatus() == TripStatus.DRIVER_CONFIRMED) &&
                LocalDateTime.now().isAfter(trip.getDepartureTime().plusMinutes(30))) {
            trip.setStatus(TripStatus.EXPIRED);
            trip = repository.save(trip);
        }
        return trip;
    }

    // --- Trip Lifecycle Management ---

    public TripRequest editTrip(UUID tripId, CreateTripRequestDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.NEW) {
            throw new ValidationException("Only NEW trips can be edited");
        }
        if (dto.getReturnTime().isBefore(dto.getDepartureTime()) ||
                dto.getReturnTime().isEqual(dto.getDepartureTime())) {
            throw new ValidationException("Return time must be after departure time");
        }
        trip.setPurpose(dto.getPurpose());
        trip.setDestination(dto.getDestination());
        trip.setDepartureTime(dto.getDepartureTime());
        trip.setReturnTime(dto.getReturnTime());
        trip.setPassengerCount(dto.getPassengerCount());
        trip.setDistanceKm(dto.getDistanceKm());
        return repository.save(trip);
    }

    public TripRequest submitTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.NEW) {
            throw new ValidationException("Only NEW trips can be submitted");
        }
        trip.setStatus(TripStatus.SUBMITTED);
        return repository.save(trip);
    }

    public TripRequest approveTrip(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        // Allows re-approval if a previously assigned driver rejected the trip
        if (trip.getStatus() != TripStatus.SUBMITTED && trip.getStatus() != TripStatus.DRIVER_REJECTED) {
            throw new ValidationException("Only SUBMITTED or DRIVER_REJECTED trips can be approved");
        }

        // Prevent double booking conflicts at approval stage
        if (dto.getAssignedDriverId() != null) {
            List<TripRequest> conflicts = repository.findConflictingDriverBookings(
                    dto.getAssignedDriverId(),
                    trip.getDepartureTime(),
                    trip.getReturnTime());
            conflicts.removeIf(c -> c.getId().equals(tripId));
            if (!conflicts.isEmpty()) {
                throw new ValidationException("Driver is already assigned for this time slot");
            }
        }
        if (dto.getAssignedVehicleId() != null) {
            List<TripRequest> conflicts = repository.findConflictingVehicleBookings(
                    dto.getAssignedVehicleId(),
                    trip.getDepartureTime(),
                    trip.getReturnTime());
            conflicts.removeIf(c -> c.getId().equals(tripId));
            if (!conflicts.isEmpty()) {
                throw new ValidationException("Vehicle is already booked for this time slot");
            }
        }

        trip.setStatus(TripStatus.APPROVED);
        trip.setApproverId(dto.getApproverId());
        trip.setApprovalNotes(dto.getNotes());
        trip.setAssignedVehicleId(dto.getAssignedVehicleId());
        trip.setAssignedDriverId(dto.getAssignedDriverId());
        return repository.save(trip);
    }

    public TripRequest rejectTrip(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.SUBMITTED) {
            throw new ValidationException("Only SUBMITTED trips can be rejected");
        }
        trip.setStatus(TripStatus.REJECTED);
        trip.setApproverId(dto.getApproverId());
        trip.setApprovalNotes(dto.getNotes());
        return repository.save(trip);
    }

    public TripRequest assignDriver(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can have a driver assigned");
        }
        // Prevent driver double-booking
        List<TripRequest> conflicts = repository.findConflictingDriverBookings(
                dto.getAssignedDriverId(),
                trip.getDepartureTime(),
                trip.getReturnTime());
        if (!conflicts.isEmpty()) {
            throw new ValidationException("Driver is already assigned for this time slot");
        }
        trip.setAssignedDriverId(dto.getAssignedDriverId());
        return repository.save(trip);
    }

    public TripRequest assignVehicle(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can have a vehicle assigned");
        }
        // Prevent vehicle double-booking
        List<TripRequest> conflicts = repository.findConflictingVehicleBookings(
                dto.getAssignedVehicleId(),
                trip.getDepartureTime(),
                trip.getReturnTime());
        if (!conflicts.isEmpty()) {
            throw new ValidationException("Vehicle is already booked for this time slot");
        }
        trip.setAssignedVehicleId(dto.getAssignedVehicleId());
        return repository.save(trip);
    }

    public TripRequest driverAcceptTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can be accepted by driver");
        }
        trip.setStatus(TripStatus.DRIVER_CONFIRMED);
        return repository.save(trip);
    }

    public TripRequest driverRejectTrip(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can be rejected by driver");
        }
        // Clear assignment so administrative staff can cleanly reassign a different driver/vehicle
        trip.setStatus(TripStatus.DRIVER_REJECTED);
        trip.setApprovalNotes("Driver rejected: " + dto.getNotes());
        trip.setAssignedDriverId(null);
        trip.setAssignedVehicleId(null);
        return repository.save(trip);
    }

    public TripRequest startTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.DRIVER_CONFIRMED) {
            throw new ValidationException("Only DRIVER_CONFIRMED trips can be started");
        }

        // Validate starting window (+/- 30 minutes of requested departureTime)
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(trip.getDepartureTime().minusMinutes(30)) ||
                now.isAfter(trip.getDepartureTime().plusMinutes(30))) {
            if (now.isAfter(trip.getDepartureTime().plusMinutes(30))) {
                trip.setStatus(TripStatus.EXPIRED);
                repository.save(trip);
            }
            throw new ValidationException("Trip cannot be started");
        }

        trip.setStatus(TripStatus.ONGOING);
        trip.setStartTime(now);
        return repository.save(trip);
    }

    public TripRequest completeTrip(UUID tripId) {
        return completeTrip(tripId, null);
    }

    public TripRequest completeTrip(UUID tripId, String reason) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.ONGOING) {
            throw new ValidationException("Only ONGOING trips can be completed");
        }

        // Validate that all intermediate stops have arrival timestamps recorded
        if (trip.getDestination() != null && trip.getDestination().contains(" -> ")) {
            String[] places = trip.getDestination().split(" -> ");
            int expectedStops = places.length - 2;
            if (expectedStops > 0) {
                String currentArrivals = trip.getStopArrivalTimes();
                int arrivalsCount = (currentArrivals == null || currentArrivals.trim().isEmpty())
                        ? 0 : currentArrivals.split(",").length;
                if (arrivalsCount < expectedStops) {
                    throw new ValidationException("Cannot end trip: all intermediate stops must be logged first.");
                }
            }
        }

        // Require reason if completion time deviates by more than 30 minutes
        LocalDateTime now = LocalDateTime.now();
        boolean deviates = now.isBefore(trip.getReturnTime().minusMinutes(30)) ||
                           now.isAfter(trip.getReturnTime().plusMinutes(30));
        if (deviates) {
            if (reason == null || reason.trim().isEmpty()) {
                throw new ValidationException("Completion time deviates by more than 30 minutes. A reason must be provided.");
            }
            trip.setDriverTimelineReason(reason);
        }

        trip.setStatus(TripStatus.COMPLETED);
        trip.setEndTime(now);
        return repository.save(trip);
    }

    public TripRequest submitDriverFeedback(UUID tripId, Integer rating, String feedback) {
        return submitDriverFeedback(tripId, rating, feedback, null);
    }

    public TripRequest submitDriverFeedback(UUID tripId, Integer rating, String feedback, String staffTimelineReason) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.COMPLETED) {
            throw new ValidationException("Feedback can only be submitted for completed trips");
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new ValidationException("Rating must be between 1 and 5");
        }

        // Require staff reason if actual completion time was early or late by 30 mins
        if (trip.getEndTime() != null) {
            boolean deviates = trip.getEndTime().isBefore(trip.getReturnTime().minusMinutes(30)) ||
                               trip.getEndTime().isAfter(trip.getReturnTime().plusMinutes(30));
            if (deviates && (staffTimelineReason == null || staffTimelineReason.trim().isEmpty())) {
                throw new ValidationException("Trip ended outside the 30-minute return window. Staff must provide a justification reason.");
            }
            if (deviates) {
                trip.setStaffTimelineReason(staffTimelineReason);
            }
        }

        trip.setDriverRating(rating);
        trip.setDriverFeedback(feedback);
        return repository.save(trip);
    }

    public TripRequest logStopArrival(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.ONGOING) {
            throw new ValidationException("Stops can only be logged for ONGOING trips");
        }

        String dest = trip.getDestination();
        if (dest == null || !dest.contains(" -> ")) {
            throw new ValidationException("This trip has no intermediate stops to log");
        }

        String[] places = dest.split(" -> ");
        int totalStops = places.length - 2;
        if (totalStops <= 0) {
            throw new ValidationException("This trip has no intermediate stops to log");
        }

        String currentArrivals = trip.getStopArrivalTimes();
        List<String> arrivalsList = new java.util.ArrayList<>();
        if (currentArrivals != null && !currentArrivals.trim().isEmpty()) {
            arrivalsList.addAll(List.of(currentArrivals.split(",")));
        }

        if (arrivalsList.size() >= totalStops) {
            throw new ValidationException("All intermediate stops have already been logged");
        }

        arrivalsList.add(LocalDateTime.now().toString());
        trip.setStopArrivalTimes(String.join(",", arrivalsList));
        return repository.save(trip);
    }

    public List<Long> getActiveVehicleIds() {
        return repository.findActiveVehicleIds(List.of(
            TripStatus.APPROVED,
            TripStatus.DRIVER_CONFIRMED,
            TripStatus.ONGOING
        ));
    }

    public TripRequest cancelTrip(UUID tripId, UUID cancelledBy, String reason) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() == TripStatus.COMPLETED ||
            trip.getStatus() == TripStatus.CANCELLED) {
            throw new ValidationException("Cannot cancel a completed or already cancelled trip");
        }
        trip.setStatus(TripStatus.CANCELLED);
        trip.setApprovalNotes(reason);
        return repository.save(trip);
    }

    // --- Queries and Reporting ---

    public List<TripRequest> getTripsByDriver(UUID driverId) {
        List<TripRequest> list = repository.findByAssignedDriverIdOrderByDepartureTimeAsc(driverId);
        list.forEach(this::checkAndExpireTrip);
        return list;
    }

    public List<TripRequest> getUpcomingTripsByDriver(UUID driverId) {
        List<TripRequest> list = repository.findByAssignedDriverIdAndStatusOrderByDepartureTimeAsc(
                driverId, TripStatus.APPROVED);
        list.forEach(this::checkAndExpireTrip);
        return list;
    }

    public List<TripRequest> getRequesterTripHistory(UUID requesterId) {
        List<TripRequest> list = repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
        list.forEach(this::checkAndExpireTrip);
        return list;
    }

    public List<TripRequest> getRequesterActiveTrips(UUID requesterId) {
        List<TripRequest> list = repository.findByRequesterIdAndStatusInOrderByDepartureTimeAsc(
                requesterId, List.of(TripStatus.NEW, TripStatus.SUBMITTED, TripStatus.APPROVED, TripStatus.ONGOING));
        list.forEach(this::checkAndExpireTrip);
        return list;
    }

    public List<TripRequest> getTripsForCalendar(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);
        List<TripRequest> list = repository.findByDepartureTimeBetweenOrderByDepartureTimeAsc(start, end);
        list.forEach(this::checkAndExpireTrip);
        return list;
    }

    public List<TripRequest> searchTrips(String destination, TripStatus status, UUID requesterId) {
        List<TripRequest> all = repository.findAll();
        all.forEach(this::checkAndExpireTrip);
        return all.stream()
                .filter(t -> destination == null || t.getDestination().toLowerCase().contains(destination.toLowerCase()))
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> requesterId == null || t.getRequesterId().equals(requesterId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    private void checkAndExpireTrip(TripRequest trip) {
        if ((trip.getStatus() == TripStatus.APPROVED || trip.getStatus() == TripStatus.DRIVER_CONFIRMED) &&
                LocalDateTime.now().isAfter(trip.getDepartureTime().plusMinutes(30))) {
            trip.setStatus(TripStatus.EXPIRED);
            repository.save(trip);
        }
    }
}
