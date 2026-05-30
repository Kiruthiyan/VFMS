package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverAvailability;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityUpdateRequest {
    @NotNull
    private DriverAvailability.AvailabilityStatus status;

    private String reason;
}
