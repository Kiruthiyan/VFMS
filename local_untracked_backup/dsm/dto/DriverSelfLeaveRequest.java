package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverLeave;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

/**
 * Leave request DTO for the driver self-portal.
 * driverId is deliberately excluded — the server resolves it from the JWT.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverSelfLeaveRequest {
    @NotNull
    private DriverLeave.LeaveType leaveType;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private String reason;
}
