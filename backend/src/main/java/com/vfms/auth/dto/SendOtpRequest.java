package com.vfms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for the legacy OTP email flow.
 */
@Data
public class SendOtpRequest {

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    private String email;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }
}
