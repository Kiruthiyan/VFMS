package com.vfms.dsm.dto;

import lombok.*;
import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class QualificationCheckResponse {
    private UUID driverId;
    private String vehicleCategory;
    private boolean qualified;
    private List<String> reasons;
}
