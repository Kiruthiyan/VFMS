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
    @Pattern(
        regexp = "^[A-Za-z][A-Za-z\\s'’-]*$",
        message = "Please enter a valid full name."
    )
    private String fullName;

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(
        regexp = "^(?:\\+94|0)(70|71|72|74|75|76|77|78)\\d{7}$",
        message = "Please enter a valid phone number."
    )
    private String phone;

    @NotBlank(message = "NIC is required")
    @Pattern(
        regexp = "^(?:\\d{9}[VvXx]|\\d{12})$",
        message = "Please enter a valid NIC number."
    )
    private String nic;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be at least 8 characters.")
    @Pattern(
        regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,128}$",
        message = "Password must include uppercase, lowercase, number, and special character."
    )
    private String password;

    @NotBlank(message = "Please confirm your password")
    private String confirmPassword;

    @NotNull(message = "Please select a role.")
    private Role requestedRole;

    // ── DRIVER FIELDS — required if requestedRole = DRIVER ─────────────────

    @Pattern(
        regexp = "^$|^[A-Z0-9]{6,20}$",
        message = "Please enter a valid license number."
    )
    private String licenseNumber;

    @Pattern(
        regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$",
        message = "Please enter a valid license expiry date."
    )
    private String licenseExpiryDate;

    private String certifications;

    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 70, message = "Experience years cannot exceed 70")
    private Integer experienceYears;

    // ── STAFF FIELDS — required if requestedRole = SYSTEM_USER ─────────────

    @Pattern(
        regexp = "^$|^[A-Z0-9]{3,20}$",
        message = "Please enter a valid employee ID."
    )
    private String employeeId;

    private String department;

    private String officeLocation;

    private String designation;
}
