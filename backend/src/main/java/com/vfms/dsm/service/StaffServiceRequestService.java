package com.vfms.dsm.service;

import com.vfms.dsm.dto.ServiceRequestDto;
import com.vfms.dsm.entity.*;
import com.vfms.dsm.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.StaffServiceRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service @RequiredArgsConstructor @Transactional
public class StaffServiceRequestService {
    private final StaffServiceRequestRepository requestRepository;
    private final StaffService staffService;

    public StaffServiceRequest createRequest(ServiceRequestDto dto) {
        Staff staff = staffService.findById(dto.getStaffId());
        StaffServiceRequest request = StaffServiceRequest.builder()
            .staff(staff).vehicleId(dto.getVehicleId())
            .requestType(dto.getRequestType()).description(dto.getDescription())
            .urgency(dto.getUrgency() != null ? dto.getUrgency() : StaffServiceRequest.Urgency.MEDIUM)
            .build();
        return requestRepository.save(request);
    }

    public List<StaffServiceRequest> getRequestsByStaff(Long staffId) {
        return requestRepository.findByStaffId(staffId);
    }

    public List<StaffServiceRequest> getOpenRequests() {
        return requestRepository.findByStatus(StaffServiceRequest.RequestStatus.OPEN);
    }

    public StaffServiceRequest updateStatus(Long id, StaffServiceRequest.RequestStatus status) {
        StaffServiceRequest req = requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Service request not found: " + id));
        req.setStatus(status);
        return requestRepository.save(req);
    }
}
