package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverLeave;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalRequest {

    @NotNull
    private DriverLeave.LeaveStatus status;

    private String approvalNotes;
}
