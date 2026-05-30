package com.vfms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Minimal response payload that reports whether the submitted OTP matched.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpResponse {
    private boolean verified;
}
