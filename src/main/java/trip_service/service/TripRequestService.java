package trip_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import trip_service.dto.ApprovalDTO;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;
import trip_service.repository.TripRequestRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TripRequestService {

    private final TripRequestRepository repository;

    // Create a new trip request (status = NEW)
    public TripRequest createTrip(CreateTripRequestDTO dto) {
        if (dto.getReturnTime().isBefore(dto.getDepartureTime())) {
            throw new RuntimeException("Return time cannot be before departure time");
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

    // Submit a trip request (NEW → SUBMITTED)
    public TripRequest submitTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.NEW) {
            throw new RuntimeException("Only NEW trips can be submitted");
        }
        trip.setStatus(TripStatus.SUBMITTED);
        return repository.save(trip);
    }

    // Approve a trip and assign vehicle + driver
    public TripRequest approveTrip(UUID tripId, ApprovalDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.SUBMITTED) {
            throw new RuntimeException("Only SUBMITTED trips can be approved");
        }

        // Check vehicle conflict
        if (dto.getAssignedVehicleId() != null) {
            List<TripRequest> vehicleConflicts = repository.findConflictingVehicleBookings(
                    dto.getAssignedVehicleId(),
                    trip.getDepartureTime(),
                    trip.getReturnTime());
            if (!vehicleConflicts.isEmpty()) {
                throw new RuntimeException("Vehicle is already booked for this time slot");
            }
        }

        // Check driver conflict
        if (dto.getAssignedDriverId() != null) {
            List<TripRequest> driverConflicts = repository.findConflictingDriverBookings(
                    dto.getAssignedDriverId(),
                    trip.getDepartureTime(),
                    trip.getReturnTime());
            if (!driverConflicts.isEmpty()) {
                throw new RuntimeException("Driver is already assigned for this time slot");
            }
        }

        trip.setStatus(TripStatus.APPROVED);
        trip.setApproverId(dto.getApproverId());
        trip.setApprovalNotes(dto.getNotes());
        trip.setAssignedVehicleId(dto.getAssignedVehicleId());
        trip.setAssignedDriverId(dto.getAssignedDriverId());
        return repository.save(trip);
    }

    // Reject a trip
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

    // Start a trip (APPROVED → ONGOING)
    public TripRequest startTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED trips can be started");
        }
        trip.setStatus(TripStatus.ONGOING);
        return repository.save(trip);
    }

    // Complete a trip (ONGOING → COMPLETED)
    public TripRequest completeTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.ONGOING) {
            throw new RuntimeException("Only ONGOING trips can be completed");
        }
        trip.setStatus(TripStatus.COMPLETED);
        return repository.save(trip);
    }

    // Cancel a trip
    public TripRequest cancelTrip(UUID tripId) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() == TripStatus.COMPLETED || trip.getStatus() == TripStatus.CANCELLED) {
            throw new RuntimeException("Cannot cancel a completed or already cancelled trip");
        }
        trip.setStatus(TripStatus.CANCELLED);
        return repository.save(trip);
    }

    // Get all trips
    public List<TripRequest> getAllTrips() {
        return repository.findAll();
    }

    // Get trips by requester
    public List<TripRequest> getTripsByRequester(UUID requesterId) {
        return repository.findByRequesterIdOrderByCreatedAtDesc(requesterId);
    }

    // Get trips by driver
    public List<TripRequest> getTripsByDriver(UUID driverId) {
        return repository.findByAssignedDriverIdOrderByDepartureTimeAsc(driverId);
    }

    // Get trips by status
    public List<TripRequest> getTripsByStatus(TripStatus status) {
        return repository.findByStatusOrderByCreatedAtDesc(status);
    }

    // Get single trip
    public TripRequest getTripById(UUID tripId) {
        return findById(tripId);
    }

    // Edit a trip (only when NEW)
    public TripRequest editTrip(UUID tripId, CreateTripRequestDTO dto) {
        TripRequest trip = findById(tripId);
        if (trip.getStatus() != TripStatus.NEW) {
            throw new RuntimeException("Only NEW trips can be edited");
        }
        trip.setPurpose(dto.getPurpose());
        trip.setDestination(dto.getDestination());
        trip.setDepartureTime(dto.getDepartureTime());
        trip.setReturnTime(dto.getReturnTime());
        trip.setPassengerCount(dto.getPassengerCount());
        trip.setDistanceKm(dto.getDistanceKm());
        return repository.save(trip);
    }

    private TripRequest findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }
}