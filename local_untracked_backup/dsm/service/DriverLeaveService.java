package com.vfms.dsm.service;

import com.vfms.dsm.dto.AvailabilityUpdateRequest;
import com.vfms.dsm.dto.LeaveApprovalRequest;
import com.vfms.dsm.dto.LeaveRequest;
import com.vfms.dsm.entity.Driver;
import com.vfms.dsm.entity.DriverAvailability;
import com.vfms.dsm.entity.DriverLeave;
import com.vfms.dsm.exception.ResourceNotFoundException;
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
    private final DriverAvailabilityService availabilityService;

    public DriverLeave requestLeave(LeaveRequest request) {
        Driver driver = driverService.findById(request.getDriverId());

        DriverLeave leave = DriverLeave.builder()
                .driver(driver)
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

        if (request.getStatus() == DriverLeave.LeaveStatus.APPROVED) {
            AvailabilityUpdateRequest availabilityUpdate = new AvailabilityUpdateRequest(
                    DriverAvailability.AvailabilityStatus.ON_LEAVE,
                    "Leave approved");
            availabilityService.updateAvailability(leave.getDriver().getId(), availabilityUpdate, approvedBy);
        }

        return leaveRepository.save(leave);
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getLeavesByDriver(UUID driverId) {
        return leaveRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
    }

    @Transactional(readOnly = true)
    public List<DriverLeave> getPendingLeaves() {
        return leaveRepository.findByStatusOrderByCreatedAtDesc(DriverLeave.LeaveStatus.PENDING);
    }

    @Scheduled(cron = "0 0 7 * * *")
    public void restoreAvailabilityAfterLeave() {
        List<DriverLeave> endingToday = leaveRepository.findLeavesEndingToday(LocalDate.now());

        for (DriverLeave leave : endingToday) {
            AvailabilityUpdateRequest availabilityUpdate = new AvailabilityUpdateRequest(
                    DriverAvailability.AvailabilityStatus.AVAILABLE,
                    "Leave period ended");
            availabilityService.updateAvailability(leave.getDriver().getId(), availabilityUpdate, "SYSTEM");
        }
    }
}
