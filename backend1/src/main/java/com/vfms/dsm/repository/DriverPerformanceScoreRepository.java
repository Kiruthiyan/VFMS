package com.vfms.dsm.repository;

import com.vfms.dsm.entity.DriverPerformanceScore;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DriverPerformanceScoreRepository extends JpaRepository<DriverPerformanceScore, Long> {

    List<DriverPerformanceScore> findByDriverIdOrderByPeriodYearDescPeriodMonthDesc(UUID driverId);

    Optional<DriverPerformanceScore> findByDriverIdAndPeriodYearAndPeriodMonth(UUID driverId, int year, int month);
}
