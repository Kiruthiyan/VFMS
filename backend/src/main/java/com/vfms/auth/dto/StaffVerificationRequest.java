package com.vfms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Captures the verified staff details that must match the company registry
 * before a self-service account can continue to password setup.
 */
@Data
public class StaffVerificationRequest {

    @Email(message = "Please enter a valid company email address.")
    @NotBlank(message = "Company email address is required.")
    private String email;

    @NotBlank(message = "Full name is required.")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters.")
    @Pattern(
            regexp = "^[A-Za-z][A-Za-z\\s'-]*$",
            message = "Please enter your full name as it appears in company records."
    )
    private String fullName;

    @NotBlank(message = "Phone number is required.")
    @Pattern(
            regexp = "^(?:\\+94|0)(70|71|72|74|75|76|77|78)\\d{7}$",
            message = "Please enter a valid Sri Lankan mobile number."
    )
    private String phone;

    @NotBlank(message = "NIC number is required.")
    @Pattern(
            regexp = "^(?:\\d{9}[VvXx]|\\d{12})$",
            message = "Please enter a valid NIC number."
    )
    private String nic;

    @NotBlank(message = "Employee ID is required.")
    @Pattern(
            regexp = "(?i)^[A-Z0-9]{5,10}$",
            message = "Please enter a valid employee ID."
    )
    private String employeeId;
}
