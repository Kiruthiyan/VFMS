package trip_service;

import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import trip_service.dto.ApprovalDTO;
import trip_service.dto.CreateTripRequestDTO;
import trip_service.entity.TripRequest;
import trip_service.enums.TripStatus;
import trip_service.repository.TripRequestRepository;
import trip_service.service.TripRequestService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TripServiceApplicationTests {

    @Mock
    private TripRequestRepository repository;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private TripRequestService service;

    private TripRequest sampleTrip;
    private UUID tripId;
    private UUID requesterId;

    @BeforeEach
    void setUp() {
        tripId = UUID.randomUUID();
        requesterId = UUID.randomUUID();

        sampleTrip = TripRequest.builder()
                .id(tripId)
                .requesterId(requesterId)
                .purpose("Client meeting")
                .destination("Colombo Fort")
                .departureTime(LocalDateTime.now().plusDays(1))
                .returnTime(LocalDateTime.now().plusDays(1).plusHours(8))
                .passengerCount(2)
                .status(TripStatus.NEW)
                .build();
    }

    // =============================================
    // CREATE TRIP TESTS
    // =============================================

    @Test
    void createTrip_ShouldSucceed_WhenValidData() {
        CreateTripRequestDTO dto = new CreateTripRequestDTO();
        dto.setRequesterId(requesterId);
        dto.setPurpose("Client meeting");
        dto.setDestination("Colombo Fort");
        dto.setDepartureTime(LocalDateTime.now().plusDays(1));
        dto.setReturnTime(LocalDateTime.now().plusDays(1).plusHours(8));
        dto.setPassengerCount(2);

        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.createTrip(dto);

        assertNotNull(result);
        assertEquals(TripStatus.NEW, result.getStatus());
        assertEquals("Colombo Fort", result.getDestination());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void createTrip_ShouldFail_WhenReturnTimeBeforeDepartureTime() {
        CreateTripRequestDTO dto = new CreateTripRequestDTO();
        dto.setRequesterId(requesterId);
        dto.setPurpose("Test trip");
        dto.setDestination("Kandy");
        dto.setDepartureTime(LocalDateTime.now().plusDays(2));
        dto.setReturnTime(LocalDateTime.now().plusDays(1));
        dto.setPassengerCount(1);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.createTrip(dto));

        assertEquals("Return time must be after departure time", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void createTrip_ShouldFail_WhenReturnTimeEqualsDepartureTime() {
        LocalDateTime sameTime = LocalDateTime.now().plusDays(1);
        CreateTripRequestDTO dto = new CreateTripRequestDTO();
        dto.setRequesterId(requesterId);
        dto.setPurpose("Test trip");
        dto.setDestination("Kandy");
        dto.setDepartureTime(sameTime);
        dto.setReturnTime(sameTime);
        dto.setPassengerCount(1);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.createTrip(dto));

        assertEquals("Return time must be after departure time", exception.getMessage());
    }

    // =============================================
    // SUBMIT TRIP TESTS
    // =============================================

    @Test
    void submitTrip_ShouldSucceed_WhenTripIsNew() {
        sampleTrip.setStatus(TripStatus.NEW);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.submitTrip(tripId);

        assertEquals(TripStatus.SUBMITTED, result.getStatus());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void submitTrip_ShouldFail_WhenTripIsAlreadySubmitted() {
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.submitTrip(tripId));

        assertEquals("Only NEW trips can be submitted", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void submitTrip_ShouldFail_WhenTripNotFound() {
        when(repository.findById(tripId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.submitTrip(tripId));

        assertTrue(exception.getMessage().contains("Trip not found"));
    }

    // =============================================
    // APPROVE TRIP TESTS
    // =============================================

    @Test
    void approveTrip_ShouldSucceed_WhenTripIsSubmitted() {
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setAssignedVehicleId(1L);
        dto.setAssignedDriverId(UUID.randomUUID());
        dto.setNotes("Approved");

        TripRequest result = service.approveTrip(tripId, dto);

        assertEquals(TripStatus.APPROVED, result.getStatus());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void approveTrip_ShouldSucceed_WhenTripIsDriverRejected() {
        // Driver rejected means staff can re-approve with different driver/vehicle
        sampleTrip.setStatus(TripStatus.DRIVER_REJECTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setAssignedVehicleId(2L);
        dto.setAssignedDriverId(UUID.randomUUID());
        dto.setNotes("Re-approved with new driver");

        TripRequest result = service.approveTrip(tripId, dto);

        assertEquals(TripStatus.APPROVED, result.getStatus());
    }

    @Test
    void approveTrip_ShouldFail_WhenTripIsNew() {
        sampleTrip.setStatus(TripStatus.NEW);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.approveTrip(tripId, dto));

        assertEquals("Only SUBMITTED or DRIVER_REJECTED trips can be approved",
                exception.getMessage());
    }

    // =============================================
    // REJECT TRIP TESTS
    // =============================================

    @Test
    void rejectTrip_ShouldSucceed_WhenTripIsSubmitted() {
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setNotes("No vehicles available on this date");

        TripRequest result = service.rejectTrip(tripId, dto);

        assertEquals(TripStatus.REJECTED, result.getStatus());
    }

    @Test
    void rejectTrip_ShouldFail_WhenTripIsNotSubmitted() {
        sampleTrip.setStatus(TripStatus.NEW);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        ApprovalDTO dto = new ApprovalDTO();
        dto.setNotes("Some reason");

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.rejectTrip(tripId, dto));

        assertEquals("Only SUBMITTED trips can be rejected", exception.getMessage());
    }

    // =============================================
    // DRIVER ACCEPT / REJECT TESTS
    // =============================================

    @Test
    void driverAcceptTrip_ShouldSucceed_WhenTripIsApproved() {
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.driverAcceptTrip(tripId);

        assertEquals(TripStatus.DRIVER_CONFIRMED, result.getStatus());
    }

    @Test
    void driverAcceptTrip_ShouldFail_WhenTripIsNotApproved() {
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.driverAcceptTrip(tripId));

        assertEquals("Only APPROVED trips can be accepted by driver", exception.getMessage());
    }

    @Test
    void driverRejectTrip_ShouldSucceed_WhenTripIsApproved() {
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setNotes("I am not available");

        TripRequest result = service.driverRejectTrip(tripId, dto);

        assertEquals(TripStatus.DRIVER_REJECTED, result.getStatus());
        assertNull(result.getAssignedDriverId());
        assertNull(result.getAssignedVehicleId());
    }

    // =============================================
    // START TRIP TESTS
    // =============================================

    @Test
    void startTrip_ShouldSucceed_WhenTripIsDriverConfirmed() {
        sampleTrip.setStatus(TripStatus.DRIVER_CONFIRMED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.startTrip(tripId);

        assertEquals(TripStatus.ONGOING, result.getStatus());
    }

    @Test
    void startTrip_ShouldFail_WhenTripIsNotDriverConfirmed() {
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.startTrip(tripId));

        assertEquals("Only DRIVER_CONFIRMED trips can be started", exception.getMessage());
    }

    // =============================================
    // COMPLETE TRIP TESTS
    // =============================================

    @Test
    void completeTrip_ShouldSucceed_WhenTripIsOngoing() {
        sampleTrip.setStatus(TripStatus.ONGOING);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.completeTrip(tripId);

        assertEquals(TripStatus.COMPLETED, result.getStatus());
    }

    @Test
    void completeTrip_ShouldFail_WhenTripIsNotOngoing() {
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.completeTrip(tripId));

        assertEquals("Only ONGOING trips can be completed", exception.getMessage());
    }

    // =============================================
    // CANCEL TRIP TESTS
    // =============================================

    @Test
    void cancelTrip_ShouldSucceed_WhenTripIsNotCompleted() {
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        TripRequest result = service.cancelTrip(tripId, UUID.randomUUID(), "Emergency");

        assertEquals(TripStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelTrip_ShouldFail_WhenTripIsAlreadyCompleted() {
        sampleTrip.setStatus(TripStatus.COMPLETED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.cancelTrip(tripId, UUID.randomUUID(), "Reason"));

        assertEquals("Cannot cancel a completed or already cancelled trip",
                exception.getMessage());
    }

    @Test
    void cancelTrip_ShouldFail_WhenTripIsAlreadyCancelled() {
        sampleTrip.setStatus(TripStatus.CANCELLED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.cancelTrip(tripId, UUID.randomUUID(), "Reason"));

        assertEquals("Cannot cancel a completed or already cancelled trip",
                exception.getMessage());
    }

    // =============================================
    // GET TRIPS TESTS
    // =============================================

    @Test
    void getAllTrips_ShouldReturnAllTrips() {
        List<TripRequest> trips = List.of(sampleTrip);
        when(repository.findAll()).thenReturn(trips);

        List<TripRequest> result = service.getAllTrips();

        assertEquals(1, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void getTripById_ShouldReturnTrip_WhenExists() {
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        TripRequest result = service.getTripById(tripId);

        assertNotNull(result);
        assertEquals(tripId, result.getId());
    }

    @Test
    void getTripById_ShouldThrowException_WhenNotFound() {
        when(repository.findById(tripId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.getTripById(tripId));

        assertTrue(exception.getMessage().contains("Trip not found"));
    }
}