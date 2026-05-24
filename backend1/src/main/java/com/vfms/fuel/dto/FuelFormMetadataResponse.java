package com.vfms.fuel.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FuelFormMetadataResponse {
    private List<FuelLookupOptionResponse> vehicles;
    private List<FuelLookupOptionResponse> drivers;
}
