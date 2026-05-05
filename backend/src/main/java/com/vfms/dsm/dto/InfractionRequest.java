package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverInfraction;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InfractionRequest {

    @NotNull
    private UUID driverId;

    @NotNull
    private DriverInfraction.InfractionType infractionType;

    @NotNull
    private DriverInfraction.Severity severity;

    @NotNull
    private LocalDate incidentDate;

    private String description;

    private String penaltyNotes;
}
