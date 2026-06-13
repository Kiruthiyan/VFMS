package com.vfms.dsm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EligibilityCheckResponse {
    private UUID driverId;
    private String vehicleCategory;
    private boolean eligible;
    private List<String> reasons;
}
