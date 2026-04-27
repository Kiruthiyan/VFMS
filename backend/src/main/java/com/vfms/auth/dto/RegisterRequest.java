package com.vfms.auth.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO for user registration request
 * Validates all input fields with appropriate patterns and constraints
 * Supports registration for Driver and System User roles
 */
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
    @Pattern(regexp = "^[0-9+\\-()\\s]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @NotBlank(message = "NIC is required")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "NIC must be 9-12 digits")
    private String nic;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]+$",
        message = "Password must contain uppercase, lowercase, digit, and special character"
    )
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotNull(message = "Please select a role")
    private Role requestedRole;

    // ── DRIVER FIELDS — required if requestedRole = DRIVER ─────────────────

    @Pattern(
        regexp = "^[A-Z0-9]{8,20}$",
        message = "Invalid license number format (8-20 alphanumeric characters)"
    )
    private String licenseNumber;

    @Pattern(
        regexp = "^\\d{4}-\\d{2}-\\d{2}$",
        message = "License expiry date must be in YYYY-MM-DD format"
    )
    private String licenseExpiryDate;

    private String certifications;

    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 70, message = "Experience years cannot exceed 70")
    private Integer experienceYears;

    // ── STAFF FIELDS — required if requestedRole = SYSTEM_USER ─────────────

    @Pattern(
        regexp = "^[A-Z0-9]{5,10}$",
        message = "Invalid employee ID format"
    )
    private String employeeId;

    @NotBlank(message = "Department is required for staff")
    @Size(min = 2, max = 50, message = "Department must be between 2 and 50 characters")
    private String department;

    @NotBlank(message = "Office location is required for staff")
    @Size(min = 2, max = 100, message = "Office location must be between 2 and 100 characters")
    private String officeLocation;

    @NotBlank(message = "Designation is required for staff")
    @Size(min = 2, max = 50, message = "Designation must be between 2 and 50 characters")
    private String designation;
}
