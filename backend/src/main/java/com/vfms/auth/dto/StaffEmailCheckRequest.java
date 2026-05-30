package com.vfms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StaffEmailCheckRequest {

    @Email(message = "Please enter a valid company email address.")
    @NotBlank(message = "Company email address is required.")
    private String email;
}
