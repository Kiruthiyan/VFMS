package com.vfms.dsm.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "driver_performance_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverPerformanceScore extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private Driver driver;

    @Column(name = "period_year")
    private Integer periodYear;

    @Column(name = "period_month")
    private Integer periodMonth;

    @Column(name = "trip_completion_rate", precision = 5, scale = 2)
    private BigDecimal tripCompletionRate;

    @Column(name = "fuel_efficiency_ratio", precision = 5, scale = 2)
    private BigDecimal fuelEfficiencyRatio;

    @Column(name = "infraction_deduction", precision = 5, scale = 2)
    private BigDecimal infractionDeduction;

    @Column(name = "feedback_score", precision = 5, scale = 2)
    private BigDecimal feedbackScore;

    @Column(name = "composite_score", precision = 5, scale = 2)
    private BigDecimal compositeScore;
}
