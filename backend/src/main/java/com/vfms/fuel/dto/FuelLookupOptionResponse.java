package com.vfms.fuel.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class FuelLookupOptionResponse {
    private UUID id;
    private String label;
}
