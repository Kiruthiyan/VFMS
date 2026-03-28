package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverLicense;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverLicenseResponse {
    private Long id;
    private Long driverId;
    private String driverName;
    private String licenseNumber;
    private DriverLicense.LicenseCategory category;
    private String issuingAuthority;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String documentUrl;
    private Boolean isPrimary;
    private DriverLicense.LicenseStatus status;
}
