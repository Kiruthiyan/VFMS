package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for admin review actions.
 *
 * Decision must be APPROVE or REJECT.
 * Rejection reason is required by service rule when decision is REJECT.
 */
@Data
public class ReviewUserRequest {

    @NotNull(message = "Decision is required")
    private ReviewDecision decision;

    // Optional - admin may adjust role during approval.
    private Role assignedRole;

    @Size(max = 500, message = "Rejection reason must not exceed 500 characters")
    private String rejectionReason;
}
