package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.InfractionRequest;

import com.vfms.dsm.entity.DriverInfraction;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverInfractionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverInfractionService {

    private final DriverInfractionRepository infractionRepository;
    private final DriverService driverService;

    public DriverInfraction logInfraction(InfractionRequest request) {
        User user = driverService.findById(request.getDriverId());

        DriverInfraction infraction = DriverInfraction.builder()
                .user(user)
                .infractionType(request.getInfractionType())
                .severity(request.getSeverity())
                .incidentDate(request.getIncidentDate())
                .description(request.getDescription())
                .penaltyNotes(request.getPenaltyNotes())
                .build();

        return infractionRepository.save(infraction);
    }

    @Transactional(readOnly = true)
    public List<DriverInfraction> getAllInfractions() {
        return infractionRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    @Transactional(readOnly = true)
    public List<DriverInfraction> getInfractionsByDriver(UUID driverId) {
        return infractionRepository.findByUserIdOrderByCreatedAtDesc(driverId);
    }

    public DriverInfraction resolveInfraction(Long id) {
        DriverInfraction infraction = infractionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Infraction not found: " + id));

        infraction.setResolutionStatus(DriverInfraction.ResolutionStatus.RESOLVED);
        infraction.setResolvedAt(LocalDate.now());

        return infractionRepository.save(infraction);
    }

    @Transactional(readOnly = true)
    public boolean hasBlockingInfractions(UUID driverId) {
        long critical = infractionRepository.countByUserIdAndSeverityAndResolutionStatusNot(
                driverId,
                DriverInfraction.Severity.CRITICAL,
                DriverInfraction.ResolutionStatus.RESOLVED
        );

        return critical > 0;
    }
}
