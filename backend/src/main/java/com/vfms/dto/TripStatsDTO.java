package com.vfms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripStatsDTO {
    private Long total;
    private Long pending;
    private Long approved;
    private Long rejected;
    private Long active;
    private Long completed;
    private Long cancelled;
}
