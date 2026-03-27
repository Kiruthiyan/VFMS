package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateUserRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    private String email;

    private String phone;

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotNull(message = "Role is required")
    private Role role;

    // Driver-specific fields
    private String licenseNumber;
    private String licenseExpiryDate;
    private String certifications;
    private Integer experienceYears;

    // Staff / Approver fields
    private String employeeId;
    private String department;
    private String officeLocation;
    private String designation;
    private String approvalLevel;
}
