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

@Service
@RequiredArgsConstructor
public class TripRequestService {

    private final TripRequestRepository repository;

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
}