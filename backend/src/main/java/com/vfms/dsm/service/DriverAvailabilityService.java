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
    private final DriverReadinessService readinessService;

    public DriverAvailability getAvailability(UUID driverId) {
        return availabilityRepository.findById(driverId).orElseGet(() -> {
            Driver driver = driverRepository.findById(driverId)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found: " + driverId));

            DriverAvailability avail = new DriverAvailability();
            avail.setDriver(driver);
            return availabilityRepository.saveAndFlush(avail);
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
        DriverAvailability saved = availabilityRepository.save(avail);
        readinessService.refreshForDriver(driverId);
        return saved;
    }

    public List<DriverAvailability> getByStatus(DriverAvailability.AvailabilityStatus status) {
        return availabilityRepository.findByStatusOrderByUpdatedAtDesc(status);
    }

    public List<DriverAvailabilityLog> getAvailabilityHistory(UUID driverId) {
        return logRepository.findByDriverIdOrderByChangedAtDesc(driverId);
    }
}
