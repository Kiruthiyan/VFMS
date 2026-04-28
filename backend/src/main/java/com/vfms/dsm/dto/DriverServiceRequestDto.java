package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverServiceRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverServiceRequestDto {
    @NotNull
    private java.util.UUID driverId;

    private Long vehicleId;

    @NotNull
    private DriverServiceRequest.RequestType requestType;

    @NotBlank
    private String description;

    private DriverServiceRequest.Urgency urgency;
}