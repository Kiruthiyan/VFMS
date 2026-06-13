package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverServiceRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Slimmed-down service request DTO for the driver self-portal.
 * driverId is deliberately excluded — the server resolves it from the JWT.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverSelfServiceRequestDto {
    private Long vehicleId;

    @NotNull
    private DriverServiceRequest.RequestType requestType;

    @NotBlank
    private String description;

    private DriverServiceRequest.Urgency urgency;
}
