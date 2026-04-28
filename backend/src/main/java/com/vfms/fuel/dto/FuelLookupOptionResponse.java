package com.vfms.fuel.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FuelLookupOptionResponse {
    private String id;
    private String label;
}
