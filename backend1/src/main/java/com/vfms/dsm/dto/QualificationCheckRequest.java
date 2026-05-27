package com.vfms.dsm.dto;

import lombok.*;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class QualificationCheckRequest {
    private UUID driverId;
    private String vehicleCategory;
}
