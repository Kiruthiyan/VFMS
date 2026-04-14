package trip_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;
import trip_service.repository.TripRequestRepository;
import java.util.List;

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

}