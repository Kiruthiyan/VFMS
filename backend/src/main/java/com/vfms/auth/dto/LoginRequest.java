package com.vfms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO for user login request
 * Validates email and password format
 */
@Data
public class LoginRequest {

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    private String email;

    @NotBlank(message = "Password is required.")
    @Size(min = 8, max = 255, message = "Password must be at least 8 characters.")
    private String password;
}
