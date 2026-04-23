package trip_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;
import trip_service.repository.TripRequestRepository;
import java.util.List;
import java.util.UUID;
import trip_service.dto.ApprovalDTO;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TripRequestService {

    private final TripRequestRepository repository;

    public TripRequest createTrip(CreateTripRequestDTO dto) {
        if (dto.getReturnTime().isBefore(dto.getDepartureTime()) ||
                dto.getReturnTime().isEqual(dto.getDepartureTime())) {
            throw new RuntimeException("Return time must be after departure time");
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

    public TripRequest getTripById(UUID tripId) {
        return findById(tripId);
    }

    public List<TripRequest> getTripsByRequester(UUID requesterId) {
        return repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    private TripRequest findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }

    public TripRequest editTrip(UUID tripId, CreateTripRequestDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.NEW) {
            throw new RuntimeException("Only NEW trips can be edited");
        }
        if (dto.getReturnTime().isBefore(dto.getDepartureTime()) ||
                dto.getReturnTime().isEqual(dto.getDepartureTime())) {
            throw new RuntimeException("Return time must be after departure time");
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
            throw new RuntimeException("Only NEW trips can be submitted");
        }
        trip.setStatus(TripStatus.SUBMITTED);
        return repository.save(trip);
    }

    public TripRequest approveTrip(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED trips can be approved");
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
            throw new RuntimeException("Only SUBMITTED trips can be rejected");
        }
        trip.setStatus(TripStatus.REJECTED);
        trip.setApproverId(dto.getApproverId());
        trip.setApprovalNotes(dto.getNotes());
        return repository.save(trip);
    }

    public TripRequest assignDriver(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED trips can have a driver assigned");
        }
        List<TripRequest> conflicts = repository.findConflictingDriverBookings(
                dto.getAssignedDriverId(),
                trip.getDepartureTime(),
                trip.getReturnTime());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Driver is already assigned for this time slot");
        }
        trip.setAssignedDriverId(dto.getAssignedDriverId());
        return repository.save(trip);
    }

    public TripRequest assignVehicle(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED trips can have a vehicle assigned");
        }
        List<TripRequest> conflicts = repository.findConflictingVehicleBookings(
                dto.getAssignedVehicleId(),
                trip.getDepartureTime(),
                trip.getReturnTime());
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Vehicle is already booked for this time slot");
        }
        trip.setAssignedVehicleId(dto.getAssignedVehicleId());
        return repository.save(trip);
    }

    public TripRequest startTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED trips can be started");
        }
        trip.setStatus(TripStatus.ONGOING);
        return repository.save(trip);
    }

    public TripRequest completeTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.ONGOING) {
            throw new RuntimeException("Only ONGOING trips can be completed");
        }
        trip.setStatus(TripStatus.COMPLETED);
        return repository.save(trip);
    }

    public TripRequest cancelTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() == TripStatus.COMPLETED ||
                trip.getStatus() == TripStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel a completed or already cancelled trip");
        }
        trip.setStatus(TripStatus.CANCELLED);
        return repository.save(trip);
    }

    public List<TripRequest> getTripsByDriver(UUID driverId) {
        return repository.findByAssignedDriverIdOrderByDepartureTimeAsc(driverId);
    }

    public List<TripRequest> getUpcomingTripsByDriver(UUID driverId) {
        return repository.findByAssignedDriverIdAndStatusOrderByDepartureTimeAsc(
                driverId, TripStatus.APPROVED);
    }

    public List<TripRequest> getRequesterTripHistory(UUID requesterId) {
        return repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    public List<TripRequest> getRequesterActiveTrips(UUID requesterId) {
        return repository.findByRequesterIdAndStatusInOrderByDepartureTimeAsc(
                requesterId, List.of(TripStatus.NEW, TripStatus.SUBMITTED, TripStatus.APPROVED, TripStatus.ONGOING));
    }

    public List<TripRequest> getTripsForCalendar(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1).minusSeconds(1);
        return repository.findByDepartureTimeBetweenOrderByDepartureTimeAsc(start, end);
    }

    public List<TripRequest> searchTrips(String destination, TripStatus status, UUID requesterId) {
        List<TripRequest> all = repository.findAll();
        return all.stream()
                .filter(t -> destination == null || t.getDestination().toLowerCase().contains(destination.toLowerCase()))
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> requesterId == null || t.getRequesterId().equals(requesterId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }
}