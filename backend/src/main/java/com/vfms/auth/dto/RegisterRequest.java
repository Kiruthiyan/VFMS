package com.vfms.auth.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    // ── COMMON — all roles ─────────────────────────────────────────────────

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotBlank(message = "NIC is required")
    private String nic;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotNull(message = "Please select a role")
    private Role requestedRole;

    // ── DRIVER FIELDS — required if requestedRole = DRIVER ─────────────────

    private String licenseNumber;
    private String licenseExpiryDate; // format: YYYY-MM-DD
    private String certifications;
    private Integer experienceYears;

    // ── STAFF FIELDS — required if requestedRole = SYSTEM_USER ─────────────

    private String employeeId;
    private String department;
    private String officeLocation;
    private String designation;
}
