package com.vfms.fuel.service;

import com.vfms.fuel.entity.FuelRecord;
import com.vfms.fuel.repository.FuelRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuelMisuseService {

    private final FuelRecordRepository fuelRecordRepository;

    @Value("${fuel.misuse.max-litres-per-entry:100}")
    private double maxLitresPerEntry;

    @Value("${fuel.misuse.max-entries-per-day:3}")
    private int maxEntriesPerDay;

    public String checkForMisuse(FuelRecord record) {
        if (record.getQuantity().compareTo(BigDecimal.valueOf(maxLitresPerEntry)) > 0) {
            return "Quantity exceeds maximum allowed per entry (" + maxLitresPerEntry
                    + " L). Entered: " + record.getQuantity() + " L";
        }

        long todayCount = fuelRecordRepository.countByVehicleAndDate(
                record.getVehicle().getId(),
                record.getFuelDate());
        if (todayCount >= maxEntriesPerDay) {
            return "Vehicle has already reached the maximum fuel entries for this date ("
                    + maxEntriesPerDay + "). Please review.";
        }

        List<FuelRecord> previous = fuelRecordRepository.findLatestByVehicle(record.getVehicle().getId());
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
}
