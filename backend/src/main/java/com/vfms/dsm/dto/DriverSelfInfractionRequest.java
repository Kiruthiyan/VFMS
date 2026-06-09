package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverInfraction;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

/**
 * Infraction request DTO for the driver self-portal.
 * driverId is deliberately excluded — the server resolves it from the JWT.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverSelfInfractionRequest {
    @NotNull
    private DriverInfraction.InfractionType infractionType;

    @NotNull
    private DriverInfraction.Severity severity;

    @NotNull
    private LocalDate incidentDate;

    private String description;
    private String penaltyNotes;
}
