package com.vfms.dsm.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverComplianceResponse {
    private UUID driverId;
    private String driverName;
    private String employeeId;
    private LocalDate licenseExpiry;
    private boolean licenseValid;
    private boolean allCertsValid;
    private boolean onLeaveToday;
    private int complianceScore;
    private String notReadyReason;
}
