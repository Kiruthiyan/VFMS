package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverCertification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationRequest {
    @NotNull
    private UUID driverId;

    @NotNull
    private DriverCertification.CertificationType certType;

    @NotBlank
    private String certName;

    private String issuedBy;

    @NotNull
    private LocalDate issueDate;

    private LocalDate expiryDate;
}
