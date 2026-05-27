package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverLicense;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverLicenseRequest {
    @NotNull private UUID driverId;
    @NotBlank private String licenseNumber;
    @NotNull private DriverLicense.LicenseCategory category;
    private String issuingAuthority;
    @NotNull private LocalDate issueDate;
    @NotNull private LocalDate expiryDate;
    private Boolean isPrimary;
}
