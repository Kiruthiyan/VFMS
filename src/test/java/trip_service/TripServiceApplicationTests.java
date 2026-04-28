package trip_service;

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

import java.math.BigDecimal;
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
        // ARRANGE - prepare test data
        CreateTripRequestDTO dto = new CreateTripRequestDTO();
        dto.setRequesterId(requesterId);
        dto.setPurpose("Client meeting");
        dto.setDestination("Colombo Fort");
        dto.setDepartureTime(LocalDateTime.now().plusDays(1));
        dto.setReturnTime(LocalDateTime.now().plusDays(1).plusHours(8));
        dto.setPassengerCount(2);

        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        // ACT - call the method
        TripRequest result = service.createTrip(dto);

        // ASSERT - check the result
        assertNotNull(result);
        assertEquals(TripStatus.NEW, result.getStatus());
        assertEquals("Colombo Fort", result.getDestination());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void createTrip_ShouldFail_WhenReturnTimeBeforeDepartureTime() {
        // ARRANGE
        CreateTripRequestDTO dto = new CreateTripRequestDTO();
        dto.setRequesterId(requesterId);
        dto.setPurpose("Test trip");
        dto.setDestination("Kandy");
        dto.setDepartureTime(LocalDateTime.now().plusDays(2));
        dto.setReturnTime(LocalDateTime.now().plusDays(1)); // return BEFORE departure
        dto.setPassengerCount(1);

        // ACT & ASSERT - should throw exception
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.createTrip(dto));

        assertEquals("Return time must be after departure time", exception.getMessage());
        verify(repository, never()).save(any()); // save should NOT be called
    }

    // =============================================
    // SUBMIT TRIP TESTS
    // =============================================

    @Test
    void submitTrip_ShouldSucceed_WhenTripIsNew() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.NEW);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        // ACT
        TripRequest result = service.submitTrip(tripId);

        // ASSERT
        assertEquals(TripStatus.SUBMITTED, result.getStatus());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void submitTrip_ShouldFail_WhenTripIsAlreadySubmitted() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.submitTrip(tripId));

        assertEquals("Only NEW trips can be submitted", exception.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void submitTrip_ShouldFail_WhenTripNotFound() {
        // ARRANGE
        when(repository.findById(tripId)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.submitTrip(tripId));

        assertTrue(exception.getMessage().contains("Trip not found"));
    }

    // =============================================
    // APPROVE TRIP TESTS
    // =============================================

    @Test
    void approveTrip_ShouldSucceed_WhenTripIsSubmitted() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.findConflictingVehicleBookings(any(), any(), any()))
                .thenReturn(List.of()); // no conflicts
        when(repository.findConflictingDriverBookings(any(), any(), any()))
                .thenReturn(List.of()); // no conflicts
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setAssignedVehicleId(1L);
        dto.setAssignedDriverId(UUID.randomUUID());
        dto.setNotes("Approved");

        // ACT
        TripRequest result = service.approveTrip(tripId, dto);

        // ASSERT
        assertEquals(TripStatus.APPROVED, result.getStatus());
        verify(repository, times(1)).save(any(TripRequest.class));
    }

    @Test
    void approveTrip_ShouldFail_WhenTripIsNotSubmitted() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.NEW); // not submitted
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.approveTrip(tripId, dto));

        assertEquals("Only SUBMITTED trips can be approved", exception.getMessage());
    }

    @Test
    void approveTrip_ShouldFail_WhenVehicleIsDoubleBooked() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.findConflictingVehicleBookings(any(), any(), any()))
                .thenReturn(List.of(sampleTrip)); // conflict exists!

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setAssignedVehicleId(1L);

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.approveTrip(tripId, dto));

        assertEquals("Vehicle is already booked for this time slot", exception.getMessage());
    }

    // =============================================
    // REJECT TRIP TESTS
    // =============================================

    @Test
    void rejectTrip_ShouldSucceed_WhenReasonProvided() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setNotes("No vehicles available on this date");

        // ACT
        TripRequest result = service.rejectTrip(tripId, dto);

        // ASSERT
        assertEquals(TripStatus.REJECTED, result.getStatus());
    }

    @Test
    void rejectTrip_ShouldFail_WhenNoReasonProvided() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        ApprovalDTO dto = new ApprovalDTO();
        dto.setApproverId(UUID.randomUUID());
        dto.setNotes(""); // empty reason

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.rejectTrip(tripId, dto));

        assertEquals("Rejection reason is required", exception.getMessage());
    }

    // =============================================
    // START TRIP TESTS
    // =============================================

    @Test
    void startTrip_ShouldSucceed_WhenTripIsApproved() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        // ACT
        TripRequest result = service.startTrip(tripId);

        // ASSERT
        assertEquals(TripStatus.ONGOING, result.getStatus());
    }

    @Test
    void startTrip_ShouldFail_WhenTripIsNotApproved() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.SUBMITTED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.startTrip(tripId));

        assertEquals("Only APPROVED trips can be started", exception.getMessage());
    }

    // =============================================
    // COMPLETE TRIP TESTS
    // =============================================

    @Test
    void completeTrip_ShouldSucceed_WhenTripIsOngoing() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.ONGOING);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        // ACT
        TripRequest result = service.completeTrip(tripId);

        // ASSERT
        assertEquals(TripStatus.COMPLETED, result.getStatus());
    }

    @Test
    void completeTrip_ShouldFail_WhenTripIsNotOngoing() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.completeTrip(tripId));

        assertEquals("Only ONGOING trips can be completed", exception.getMessage());
    }

    // =============================================
    // CANCEL TRIP TESTS
    // =============================================

    @Test
    void cancelTrip_ShouldSucceed_WhenTripIsNotCompleted() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.APPROVED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));
        when(repository.save(any(TripRequest.class))).thenReturn(sampleTrip);

        // ACT
        TripRequest result = service.cancelTrip(tripId, UUID.randomUUID(), "Emergency");

        // ASSERT
        assertEquals(TripStatus.CANCELLED, result.getStatus());
    }

    @Test
    void cancelTrip_ShouldFail_WhenTripIsAlreadyCompleted() {
        // ARRANGE
        sampleTrip.setStatus(TripStatus.COMPLETED);
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        // ACT & ASSERT
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
        // ARRANGE
        List<TripRequest> trips = List.of(sampleTrip);
        when(repository.findAll()).thenReturn(trips);

        // ACT
        List<TripRequest> result = service.getAllTrips();

        // ASSERT
        assertEquals(1, result.size());
        verify(repository, times(1)).findAll();
    }

    @Test
    void getTripById_ShouldReturnTrip_WhenExists() {
        // ARRANGE
        when(repository.findById(tripId)).thenReturn(Optional.of(sampleTrip));

        // ACT
        TripRequest result = service.getTripById(tripId);

        // ASSERT
        assertNotNull(result);
        assertEquals(tripId, result.getId());
    }

    @Test
    void getTripById_ShouldThrowException_WhenNotFound() {
        // ARRANGE
        when(repository.findById(tripId)).thenReturn(Optional.empty());

        // ACT & ASSERT
        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> service.getTripById(tripId));

        assertTrue(exception.getMessage().contains("Trip not found"));
    }
}