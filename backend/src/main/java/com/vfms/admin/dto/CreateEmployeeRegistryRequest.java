package com.vfms.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateEmployeeRegistryRequest {

    @NotBlank(message = "Employee ID is required")
    @Pattern(regexp = "(?i)^[A-Z0-9]{5,10}$", message = "Employee ID must be 5-10 alphanumeric characters")
    private String employeeId;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+\\-()\\s]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @NotBlank(message = "NIC is required")
    @Pattern(regexp = "^[0-9]{9,12}$", message = "NIC must be 9-12 digits")
    private String nic;

    @NotBlank(message = "Department is required")
    @Size(max = 100, message = "Department must not exceed 100 characters")
    private String department;

    @NotBlank(message = "Designation is required")
    @Size(max = 100, message = "Designation must not exceed 100 characters")
    private String designation;

    @NotBlank(message = "Office location is required")
    @Size(max = 100, message = "Office location must not exceed 100 characters")
    private String officeLocation;
}
