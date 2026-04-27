package trip_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateTripRequestDTO {

    @NotNull(message = "Requester ID is required")
    private UUID requesterId;

    @NotBlank(message = "Purpose is required")
    @Size(max = 500, message = "Purpose must be under 500 characters")
    private String purpose;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Departure time is required")
    private LocalDateTime departureTime;

    @NotNull(message = "Return time is required")
    private LocalDateTime returnTime;

    @Min(value = 1, message = "At least 1 passenger required")
    @Max(value = 54, message = "Passenger count cannot exceed 54")
    private Integer passengerCount = 1;

    private BigDecimal distanceKm;
}