package com.vfms.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripCompletionRequest {
    private Double endOdometer;
    private Double fuelConsumed;
    private String notes;
}
