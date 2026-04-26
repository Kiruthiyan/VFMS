package com.vfms.fuel.service;

import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuelMisuseService {

    private final FuelRecordRepository fuelRecordRepository;

    // Configurable thresholds — set in application.properties
    @Value("${fuel.misuse.max-litres-per-entry:100}")
    private double maxLitresPerEntry;

    @Value("${fuel.misuse.max-entries-per-day:3}")
    private int maxEntriesPerDay;

    /**
     * Check a new fuel record against misuse rules.
     * Returns null if no issue, or a flag reason string if flagged.
     */
    public String checkForMisuse(FuelRecord record) {
        // Rule 1 — quantity too high for single entry
        if (record.getQuantity()
                .compareTo(BigDecimal.valueOf(maxLitresPerEntry)) > 0) {
            return "Quantity exceeds maximum allowed per entry ("
                    + maxLitresPerEntry + " L). Entered: "
                    + record.getQuantity() + " L";
        }

        // Rule 2 — too many entries for same vehicle on same day
        long todayCount = fuelRecordRepository.countByVehicleAndDate(
                record.getVehicle().getId(),
                record.getFuelDate());

        // todayCount is BEFORE saving this record so > means already >= max
        if (todayCount >= maxEntriesPerDay) {
            return "Vehicle has already reached the maximum fuel entries "
                    + "for this date (" + maxEntriesPerDay
                    + "). Please review.";
        }

        // Rule 3 — odometer regression (new reading < previous reading)
        List<FuelRecord> previous = fuelRecordRepository
                .findLatestByVehicle(record.getVehicle().getId());

        if (!previous.isEmpty()) {
            double lastOdometer = previous.get(0).getOdometerReading();
            if (record.getOdometerReading() < lastOdometer) {
                return "Odometer reading (" + record.getOdometerReading()
                        + " km) is less than the previous entry ("
                        + lastOdometer + " km). Possible misuse or data error.";
            }
        }

        return null; // no misuse detected
    }
}
