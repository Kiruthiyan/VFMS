package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverCertification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

/**
 * Certification request DTO for the driver self-portal.
 * driverId is deliberately excluded — the server resolves it from the JWT.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverSelfCertificationRequest {
    @NotNull
    private DriverCertification.CertificationType certType;

    @NotBlank
    private String certName;

    private String issuedBy;

    @NotNull
    private LocalDate issueDate;

    private LocalDate expiryDate;
}
