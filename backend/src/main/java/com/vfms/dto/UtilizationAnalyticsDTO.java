package com.vfms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilizationAnalyticsDTO {
    private Double overallFleetUtilization;
    private List<UtilizationDepartmentDTO> departmentData;
    private List<UtilizationTrendDTO> completionTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationDepartmentDTO {
        private String name;
        private Long requests;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UtilizationTrendDTO {
        private String name;
        private Long completed;
        private Long cancelled;
    }
}