package com.vfms.fuel.service;

import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Applies configurable heuristics that help identify suspicious or inconsistent
 * fuel entries before they are stored or updated.
 */
@Service
@RequiredArgsConstructor
public class FuelMisuseService {

    private final FuelRecordRepository fuelRecordRepository;

    @Value("${fuel.misuse.max-litres-per-entry:100}")
    private double maxLitresPerEntry;

    @Value("${fuel.misuse.max-entries-per-day:3}")
    private int maxEntriesPerDay;

    /**
     * Applies configurable misuse heuristics before a fuel record is saved.
     * Thresholds stay in configuration so policy changes do not require code edits.
     */
    public String checkForMisuse(FuelRecord record) {
        return checkForMisuse(record, null);
    }

    public String checkForMisuse(FuelRecord record, UUID excludeRecordId) {
        if (record.getQuantity().compareTo(BigDecimal.valueOf(maxLitresPerEntry)) > 0) {
            return "Quantity exceeds maximum allowed per entry (" + maxLitresPerEntry
                    + " L). Entered: " + record.getQuantity() + " L";
        }

        long todayCount = countEntriesForDate(
                record.getVehicle().getId(),
                record.getFuelDate(),
                excludeRecordId);
        if (todayCount >= maxEntriesPerDay) {
            return "Vehicle has already reached the maximum fuel entries for this date ("
                    + maxEntriesPerDay + "). Please review.";
        }

        List<FuelRecord> previous = findPreviousEntries(
                record.getVehicle().getId(),
                excludeRecordId);
        if (!previous.isEmpty()) {
            double lastOdometer = previous.get(0).getOdometerReading();
            if (record.getOdometerReading() < lastOdometer) {
                return "Odometer reading (" + record.getOdometerReading()
                        + " km) is less than the previous entry ("
                        + lastOdometer + " km). Possible misuse or data error.";
            }
        }

        return null;
    }

    private long countEntriesForDate(Long vehicleId, LocalDate date, UUID excludeRecordId) {
        if (excludeRecordId == null) {
            return fuelRecordRepository.countByVehicleAndDate(vehicleId, date);
        }
        return fuelRecordRepository.countByVehicleAndDateExcluding(vehicleId, date, excludeRecordId);
    }

    private List<FuelRecord> findPreviousEntries(Long vehicleId, UUID excludeRecordId) {
        if (excludeRecordId == null) {
            return fuelRecordRepository.findLatestByVehicle(vehicleId);
        }
        return fuelRecordRepository.findLatestByVehicleExcluding(vehicleId, excludeRecordId);
    }
}
