package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReviewUserRequest {

    // "APPROVE" or "REJECT"
    @NotBlank(message = "Decision is required")
    private String decision;

    // Optional — admin can promote SYSTEM_USER to APPROVER only
    private Role assignedRole;

    // Required when decision = REJECT
    private String rejectionReason;
}
