package com.vfms.admin.dto;

import com.vfms.common.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request DTO for partial user profile updates by administrators.
 *
 * All fields are optional and validated only when provided.
 */
@Data
public class UpdateUserRequest {
    // Common fields
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Pattern(regexp = "^$|^[0-9+\\-()\\s]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @Pattern(regexp = "^$|^[0-9]{9,12}$", message = "NIC must be 9-12 digits")
    private String nic;

    // Role change — admin can now change any role
    private Role role;

    // Driver fields
    @Pattern(regexp = "^$|^[A-Z0-9]{8,20}$", message = "License number must be 8-20 alphanumeric characters")
    private String licenseNumber;

    @Pattern(regexp = "^$|^\\d{4}-\\d{2}-\\d{2}$", message = "License expiry date must be in YYYY-MM-DD format")
    private String licenseExpiryDate;

    @Size(max = 255, message = "Certifications must not exceed 255 characters")
    private String certifications;

    @Min(value = 0, message = "Experience years cannot be negative")
    @Max(value = 70, message = "Experience years cannot exceed 70")
    private Integer experienceYears;

    // Staff / Approver fields
    @Pattern(regexp = "^$|^[A-Z0-9]{5,10}$", message = "Employee ID must be 5-10 alphanumeric characters")
    private String employeeId;

    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @Size(max = 100, message = "Office location must not exceed 100 characters")
    private String officeLocation;

    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @Size(max = 50, message = "Approval level must not exceed 50 characters")
    private String approvalLevel;
}
