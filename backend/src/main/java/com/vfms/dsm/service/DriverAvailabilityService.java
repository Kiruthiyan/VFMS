package com.vfms.dsm.service;

import com.vfms.dsm.dto.AvailabilityUpdateRequest;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverAvailabilityLog;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverAvailabilityLogRepository;
import com.vfms.dsm.repository.DriverAvailabilityRepository;
import com.vfms.dsm.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverAvailabilityService {

    private final DriverAvailabilityRepository availabilityRepository;
    private final DriverAvailabilityLogRepository logRepository;
    private final DriverRepository driverRepository;

    public DriverAvailability getAvailability(UUID driverId) {
        return availabilityRepository.findById(driverId).orElseGet(() -> {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));

            DriverAvailability avail = new DriverAvailability();
            avail.setDriver(driver);
            avail.setDriverId(driverId);
            return availabilityRepository.save(avail);
        });
    }

    public DriverAvailability updateAvailability(UUID driverId, AvailabilityUpdateRequest request, String changedBy) {
        DriverAvailability avail = getAvailability(driverId);
        DriverAvailability.AvailabilityStatus oldStatus = avail.getStatus();

        DriverAvailabilityLog log = DriverAvailabilityLog.builder()
                .driverId(driverId)
                .oldStatus(oldStatus)
                .newStatus(request.getStatus())
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy)
                .reason(request.getReason())
                .build();
        logRepository.save(log);

        avail.setStatus(request.getStatus());
        avail.setUpdatedAt(LocalDateTime.now());
        avail.setUpdatedBy(changedBy);
        avail.setReason(request.getReason());
        return availabilityRepository.save(avail);
    }

    public List<DriverAvailability> getByStatus(DriverAvailability.AvailabilityStatus status) {
        return availabilityRepository.findByStatus(status);
    }

    public List<DriverAvailabilityLog> getAvailabilityHistory(UUID driverId) {
        return logRepository.findByDriverIdOrderByChangedAtDesc(driverId);
    }
}
