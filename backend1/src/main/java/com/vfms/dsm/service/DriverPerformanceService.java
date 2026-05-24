package com.vfms.dsm.service;

import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverInfraction;
import com.vfms.dsm.entity.DriverPerformanceScore;
import com.vfms.dsm.repository.DriverInfractionRepository;
import com.vfms.dsm.repository.DriverPerformanceScoreRepository;
import com.vfms.dsm.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DriverPerformanceService {

    private final DriverPerformanceScoreRepository scoreRepository;
    private final DriverRepository driverRepository;
    private final DriverInfractionRepository infractionRepository;

    @Transactional(readOnly = true)
    public List<DriverPerformanceScore> getScoresByDriver(UUID driverId) {
        return scoreRepository.findByDriverIdOrderByPeriodYearDescPeriodMonthDesc(driverId);
    }

    @Scheduled(cron = "0 0 1 1 * *")
    @Transactional
    public void calculateMonthlyScores() {
        YearMonth lastMonth = YearMonth.now().minusMonths(1);
        List<Driver> drivers = driverRepository.findAll();

        for (Driver driver : drivers) {
            calculateScoreForDriver(driver, lastMonth.getYear(), lastMonth.getMonthValue());
        }

        log.info("Monthly performance calculation complete for {} drivers", drivers.size());
    }

    public DriverPerformanceScore calculateScoreForDriver(Driver driver, int year, int month) {
        long criticalInfractions = infractionRepository.countByDriverIdAndSeverityAndResolutionStatusNot(
                driver.getId(),
                DriverInfraction.Severity.CRITICAL,
                DriverInfraction.ResolutionStatus.RESOLVED
        );
        long highInfractions = infractionRepository.countByDriverIdAndSeverityAndResolutionStatusNot(
                driver.getId(),
                DriverInfraction.Severity.HIGH,
                DriverInfraction.ResolutionStatus.RESOLVED
        );

        BigDecimal infractionDeduction = BigDecimal.valueOf(criticalInfractions * 20 + highInfractions * 10);
        BigDecimal tripRate = BigDecimal.valueOf(85);
        BigDecimal fuelEfficiency = BigDecimal.valueOf(80);
        BigDecimal feedbackScore = BigDecimal.valueOf(75);
        BigDecimal composite = tripRate.multiply(BigDecimal.valueOf(0.3))
                .add(fuelEfficiency.multiply(BigDecimal.valueOf(0.25)))
                .add(feedbackScore.multiply(BigDecimal.valueOf(0.15)))
                .subtract(infractionDeduction.multiply(BigDecimal.valueOf(0.3)));

        DriverPerformanceScore score = scoreRepository
                .findByDriverIdAndPeriodYearAndPeriodMonth(driver.getId(), year, month)
                .orElse(DriverPerformanceScore.builder()
                        .driver(driver)
                        .periodYear(year)
                        .periodMonth(month)
                        .build());

        score.setTripCompletionRate(tripRate);
        score.setFuelEfficiencyRatio(fuelEfficiency);
        score.setInfractionDeduction(infractionDeduction);
        score.setFeedbackScore(feedbackScore);
        score.setCompositeScore(composite.max(BigDecimal.ZERO));

        return scoreRepository.save(score);
    }
}
