package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserSummaryResponse {
    private UUID id;
    private String fullName;
    private String email;
    private String phone;
    private String nic;
    private Role role;
    private UserStatus status;
    private boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    private String rejectionReason;

    // Driver fields
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String certifications;
    private Integer experienceYears;

    // Staff / Approver fields
    private String employeeId;
    private String department;
    private String officeLocation;
    private String designation;
    private String approvalLevel;
}
