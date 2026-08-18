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
import com.vfms.common.exception.AuthorizationException;
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
        if (dto.getRequesterId() == null) {
            throw new ValidationException("Requester ID is required");
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
        trip.appendActivityLog("Trip created");
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

    public TripRequest getDriverTripById(UUID tripId, UUID driverId) {
        TripRequest trip = findById(tripId);
        ensureAssignedDriver(trip, driverId);
        return trip;
    }

    public List<TripRequest> getTripsByRequester(UUID requesterId) {
        return repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    private TripRequest findById(UUID id) {
        TripRequest trip = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + id));
        checkAndExpireTrip(trip);
        if (trip.getStatus() == TripStatus.EXPIRED) {
            trip = repository.findById(id).orElse(trip);
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
        trip.appendActivityLog("Trip submitted for approval");
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
        trip.appendActivityLog("Trip approved" +
                (dto.getAssignedDriverId() != null || dto.getAssignedVehicleId() != null ? " with driver/vehicle assigned" : ""));
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
        trip.appendActivityLog("Trip rejected: " + dto.getNotes());
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
        return acceptTrip(findById(tripId));
    }

    public TripRequest driverAcceptTrip(UUID tripId, UUID driverId) {
        return acceptTrip(findAssignedDriverTrip(tripId, driverId));
    }

    public TripRequest driverRejectTrip(UUID tripId, ApprovalDTO dto) {
        return rejectByDriver(findById(tripId), dto);
    }

    public TripRequest driverRejectTrip(UUID tripId, ApprovalDTO dto, UUID driverId) {
        return rejectByDriver(findAssignedDriverTrip(tripId, driverId), dto);
    }

    public TripRequest startTrip(UUID tripId, String reason) {
        return startTrip(findById(tripId), reason);
    }

    public TripRequest startTrip(UUID tripId, UUID driverId, String reason) {
        return startTrip(findAssignedDriverTrip(tripId, driverId), reason);
    }

    public TripRequest completeTrip(UUID tripId) {
        return completeTrip(tripId, null);
    }

    public TripRequest completeTrip(UUID tripId, String reason) {
        return completeTrip(findById(tripId), reason);
    }

    public TripRequest completeTrip(UUID tripId, String reason, UUID driverId) {
        return completeTrip(findAssignedDriverTrip(tripId, driverId), reason);
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
        return logStopArrival(findById(tripId));
    }

    public TripRequest logStopArrival(UUID tripId, UUID driverId) {
        return logStopArrival(findAssignedDriverTrip(tripId, driverId));
    }

    private TripRequest acceptTrip(TripRequest trip) {
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can be accepted by driver");
        }
        trip.setStatus(TripStatus.DRIVER_CONFIRMED);
        trip.appendActivityLog("Driver accepted assignment");
        return repository.save(trip);
    }

    private TripRequest rejectByDriver(TripRequest trip, ApprovalDTO dto) {
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new ValidationException("Only APPROVED trips can be rejected by driver");
        }
        // Resolve the rejecting driver's identity before clearing the assignment, so the
        // approver knows who rejected without needing the (about to be nulled) driver_id.
        String driverLabel = describeDriver(trip.getAssignedDriverId());
        trip.setStatus(TripStatus.DRIVER_REJECTED);
        trip.setApprovalNotes("Driver rejected by " + driverLabel + ": " + dto.getNotes());
        trip.setAssignedDriverId(null);
        trip.setAssignedVehicleId(null);
        trip.appendActivityLog("Driver rejected assignment (" + driverLabel + "): " + dto.getNotes());
        return repository.save(trip);
    }

    @SuppressWarnings("unchecked")
    private String describeDriver(UUID driverId) {
        if (driverId == null) return "Unknown driver";
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT u.full_name, d.employee_id FROM drivers d LEFT JOIN users u ON u.id = d.user_id WHERE d.id = :id"
        ).setParameter("id", driverId).getResultList();
        if (rows.isEmpty()) return "Unknown driver";
        Object[] r = rows.get(0);
        return r[0] + " (ID: " + r[1] + ")";
    }

    private TripRequest startTrip(TripRequest trip, String reason) {
        if (trip.getStatus() != TripStatus.DRIVER_CONFIRMED) {
            throw new ValidationException("Only DRIVER_CONFIRMED trips can be started");
        }

        LocalDateTime now = LocalDateTime.now();
        // Late start — auto-expire
        if (now.isAfter(trip.getDepartureTime().plusMinutes(30))) {
            trip.setStatus(TripStatus.EXPIRED);
            trip.appendActivityLog("Trip auto-expired at start attempt — departure window passed");
            repository.save(trip);
            throw new ValidationException("Trip has expired: departure window has passed");
        }
        // Early start (>30 min before departure) — require reason
        if (now.isBefore(trip.getDepartureTime().minusMinutes(30))) {
            String trimmed = (reason != null) ? reason.trim() : "";
            if (trimmed.length() < 10) {
                throw new ValidationException("Early start reason required (min 10 characters) when starting more than 30 minutes before departure");
            }
            trip.setEarlyStartReason(trimmed);
            trip.appendActivityLog("Early start requested: " + trimmed);
        }

        // Transition to START_PENDING; requester must confirm passenger onboard
        trip.setStatus(TripStatus.START_PENDING);
        trip.appendActivityLog("Driver started trip — awaiting passenger confirmation (START_PENDING)");
        return repository.save(trip);
    }

    public TripRequest confirmStart(UUID tripId, UUID confirmerId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.START_PENDING) {
            throw new ValidationException("Only START_PENDING trips can be confirmed");
        }
        if (confirmerId != null && confirmerId.equals(trip.getAssignedDriverId())) {
            throw new ValidationException("The assigned driver cannot confirm their own trip start");
        }
        trip.setStatus(TripStatus.ONGOING);
        trip.setStartTime(LocalDateTime.now());
        trip.appendActivityLog("Passenger confirmed onboard — trip started (ONGOING)");
        return repository.save(trip);
    }

    private TripRequest completeTrip(TripRequest trip, String reason) {
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
        trip.appendActivityLog("Trip completed" + (deviates ? " — deviation reason: " + reason : ""));
        return repository.save(trip);
    }

    private TripRequest logStopArrival(TripRequest trip) {
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

        // Intermediate stops are places[1..totalStops] (places[0] is origin, places[places.length-1] is final destination)
        String stopName = places[arrivalsList.size() + 1].trim();

        arrivalsList.add(LocalDateTime.now().toString());
        trip.setStopArrivalTimes(String.join(",", arrivalsList));
        trip.appendActivityLog("Arrived at stop: " + stopName);
        return repository.save(trip);
    }

    public List<Long> getActiveVehicleIds() {
        return repository.findActiveVehicleIds(List.of(
            TripStatus.APPROVED,
            TripStatus.DRIVER_CONFIRMED,
            TripStatus.START_PENDING,
            TripStatus.ONGOING
        ));
    }

    @SuppressWarnings("unchecked")
    public java.util.Map<String, Object> getAssignmentDetails(UUID tripId) {
        TripRequest trip = findById(tripId);
        java.util.Map<String, Object> result = new java.util.HashMap<>();

        if (trip.getAssignedDriverId() != null) {
            List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT d.first_name, d.last_name, d.employee_id, u.phone " +
                "FROM drivers d LEFT JOIN users u ON u.id = d.user_id WHERE d.id = :id"
            ).setParameter("id", trip.getAssignedDriverId()).getResultList();
            if (!rows.isEmpty()) {
                Object[] r = rows.get(0);
                java.util.Map<String, Object> driver = new java.util.HashMap<>();
                driver.put("id", trip.getAssignedDriverId().toString());
                driver.put("firstName", r[0]);
                driver.put("lastName", r[1]);
                driver.put("fullName", r[0] + " " + r[1]);
                driver.put("employeeId", r[2]);
                driver.put("phone", r[3]);
                result.put("driver", driver);
            }
        }

        if (trip.getAssignedVehicleId() != null) {
            Long vid = trip.getAssignedVehicleId();
            java.util.Map<String, Object> vehicle = new java.util.HashMap<>();
            if (vid >= 100_000_000L) {
                long rentalId = vid - 100_000_000L;
                List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT vehicle_type, plate_number FROM rental_records WHERE id = :id"
                ).setParameter("id", rentalId).getResultList();
                if (!rows.isEmpty()) {
                    Object[] r = rows.get(0);
                    vehicle.put("isRental", true);
                    vehicle.put("vehicleType", r[0]);
                    vehicle.put("plateNumber", r[1]);
                }
            } else {
                List<Object[]> rows = entityManager.createNativeQuery(
                    "SELECT plate_number, brand, model, color, vehicle_type FROM vehicles WHERE id = :id"
                ).setParameter("id", vid).getResultList();
                if (!rows.isEmpty()) {
                    Object[] r = rows.get(0);
                    vehicle.put("isRental", false);
                    vehicle.put("plateNumber", r[0]);
                    vehicle.put("brand", r[1]);
                    vehicle.put("model", r[2]);
                    vehicle.put("color", r[3]);
                    vehicle.put("vehicleType", r[4]);
                }
            }
            if (!vehicle.isEmpty()) result.put("vehicle", vehicle);
        }

        result.put("activityLog", trip.getTripActivityLog());

        return result;
    }

    // Statuses a requester/admin/approver may cancel a pre-start trip from
    private static final java.util.Set<TripStatus> REQUESTER_CANCELLABLE_STATUSES = java.util.Set.of(
            TripStatus.NEW, TripStatus.SUBMITTED, TripStatus.APPROVED,
            TripStatus.DRIVER_REJECTED, TripStatus.DRIVER_CONFIRMED, TripStatus.START_PENDING
    );

    // Statuses the assigned driver may cancel their own trip from (before it starts)
    private static final java.util.Set<TripStatus> DRIVER_CANCELLABLE_STATUSES = java.util.Set.of(
            TripStatus.DRIVER_CONFIRMED, TripStatus.START_PENDING
    );

    public TripRequest cancelTrip(UUID tripId, UUID cancelledBy, String reason) {
        return cancelTrip(tripId, cancelledBy, reason, false, "Requester/Admin");
    }

    public TripRequest cancelTrip(UUID tripId, UUID cancelledBy, String reason, boolean callerIsDriver, String actorLabel) {
        TripRequest trip = findById(tripId);

        if (callerIsDriver) {
            if (cancelledBy == null || !cancelledBy.equals(trip.getAssignedDriverId())) {
                throw new AuthorizationException("Drivers can only cancel their own assigned trips.");
            }
            if (!DRIVER_CANCELLABLE_STATUSES.contains(trip.getStatus())) {
                throw new ValidationException("Trip cannot be cancelled by driver from status: " + trip.getStatus());
            }
        } else if (!REQUESTER_CANCELLABLE_STATUSES.contains(trip.getStatus())) {
            throw new ValidationException("Trip cannot be cancelled from status: " + trip.getStatus());
        }

        trip.setStatus(TripStatus.CANCELLED);
        trip.setApprovalNotes(reason);
        trip.setAssignedDriverId(null);
        trip.setAssignedVehicleId(null);
        trip.appendActivityLog("Trip cancelled by " + actorLabel +
                (reason != null && !reason.isBlank() ? ": " + reason : ""));
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
        if (trip == null || trip.getStatus() == null || trip.getDepartureTime() == null) {
            return;
        }
        boolean isExpirable = trip.getStatus() == TripStatus.NEW
                || trip.getStatus() == TripStatus.SUBMITTED
                || trip.getStatus() == TripStatus.APPROVED
                || trip.getStatus() == TripStatus.DRIVER_CONFIRMED;
        if (isExpirable && LocalDateTime.now().isAfter(trip.getDepartureTime().plusMinutes(30))) {
            trip.setStatus(TripStatus.EXPIRED);
            trip.appendActivityLog("Trip auto-expired — departure window passed");
            repository.save(trip);
        }
    }

    private void ensureAssignedDriver(TripRequest trip, UUID driverId) {
        if (driverId == null || !driverId.equals(trip.getAssignedDriverId())) {
            throw new AuthorizationException("Drivers can only access their assigned trips.");
        }
    }

    private TripRequest findAssignedDriverTrip(UUID tripId, UUID driverId) {
        TripRequest trip = findById(tripId);
        ensureAssignedDriver(trip, driverId);
        return trip;
    }
}
