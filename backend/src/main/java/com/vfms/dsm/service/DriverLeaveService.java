package com.vfms.dsm.service;

import com.vfms.user.entity.User;

import com.vfms.dsm.dto.LeaveApprovalRequest;
import com.vfms.dsm.dto.LeaveRequest;

import com.vfms.dsm.entity.DriverLeave;
import com.vfms.common.exception.ResourceNotFoundException;
import com.vfms.dsm.repository.DriverLeaveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class DriverLeaveService {

    private final DriverLeaveRepository leaveRepository;
    private final DriverService driverService;

    public DriverLeave requestLeave(LeaveRequest request) {
        User user = driverService.findById(request.getDriverId());

        DriverLeave leave = DriverLeave.builder()
                .user(user)
                .leaveType(request.getLeaveType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .reason(request.getReason())
                .build();

        return leaveRepository.save(leave);
    }

    public DriverLeave processLeave(Long leaveId, LeaveApprovalRequest request, String approvedBy) {
        DriverLeave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException("Leave not found: " + leaveId));

        leave.setStatus(request.getStatus());
        leave.setApprovedBy(approvedBy);
        leave.setApprovalNotes(request.getApprovalNotes());

        return leaveRepository.save(leave);
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getLeavesByDriver(UUID driverId) {
        return leaveRepository.findByUserIdOrderByCreatedAtDesc(driverId);
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getAllLeaves() {
        return leaveRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(DriverLeave.LeaveStatus.PENDING);
    }

    @Scheduled(cron = "0 0 7 * * *")
    public void restoreAvailabilityAfterLeave() {
        // Readiness cache cron will handle daily updates
        // No manual availability status to restore
    }
}
