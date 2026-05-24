package com.vfms.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for OTP verification.
 */
@Data
public class VerifyOtpRequest {

    @Email(message = "Please enter a valid email address.")
    @NotBlank(message = "Email is required.")
    private String email;

    @NotBlank(message = "Please enter the verification code sent to your email.")
    private String otp;

    public void setEmail(String email) {
        this.email = email == null ? null : email.trim();
    }

    public void setOtp(String otp) {
        this.otp = otp == null ? null : otp.trim();
    }
}
