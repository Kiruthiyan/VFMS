package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String phone;
    private String department;
    private String officeLocation;
    private String designation;
    private String approvalLevel;
    // Role change — SYSTEM_USER → APPROVER only
    private Role role;
}
