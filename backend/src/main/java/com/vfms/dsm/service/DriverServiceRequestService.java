package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.DriverServiceRequestDto;

import com.vfms.dsm.entity.DriverServiceRequest;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverServiceRequestService {

    private final DriverServiceRequestRepository requestRepository;
    private final DriverService driverService;

    public DriverServiceRequest createRequest(DriverServiceRequestDto dto) {
        User user = driverService.findById(dto.getDriverId());
        DriverServiceRequest request = DriverServiceRequest.builder()
                .user(user)
                .vehicleId(dto.getVehicleId())
                .requestType(dto.getRequestType())
                .description(dto.getDescription())
                .urgency(dto.getUrgency() != null ? dto.getUrgency() : DriverServiceRequest.Urgency.MEDIUM)
                .build();
        return requestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<DriverServiceRequest> getRequestsByDriver(UUID driverId) {
        return requestRepository.findByUser_IdOrderByCreatedAtDesc(driverId);
    }

    @Transactional(readOnly = true)
    public List<DriverServiceRequest> getOpenRequests() {
        return requestRepository.findByStatusOrderByCreatedAtDesc(DriverServiceRequest.RequestStatus.OPEN);
    }

    public DriverServiceRequest updateStatus(Long id, DriverServiceRequest.RequestStatus status) {
        DriverServiceRequest req = requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver service request not found: " + id));
        req.setStatus(status);
        return requestRepository.save(req);
    }
}
