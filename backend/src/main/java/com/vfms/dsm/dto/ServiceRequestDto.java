package com.vfms.dsm.dto;

import com.vfms.dsm.entity.StaffServiceRequest;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ServiceRequestDto {
    @NotNull private Long staffId;
    private Long vehicleId;
    @NotNull private StaffServiceRequest.RequestType requestType;
    @NotBlank private String description;
    private StaffServiceRequest.Urgency urgency;
}
