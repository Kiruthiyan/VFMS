package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverAggregate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/** Request contracts for all DSM endpoints. */
public final class DriverRequests {
    private DriverRequests() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CertificationRequest {
        @NotNull private UUID driverId;
        @NotNull private DriverAggregate.DriverCertification.CertificationType certType;
        @NotBlank private String certName;
        private String issuedBy;
        @NotNull private LocalDate issueDate;
        private LocalDate expiryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverLicenseRequest {
        @NotNull private UUID driverId;
        @NotBlank private String licenseNumber;
        @NotNull private DriverAggregate.DriverLicense.LicenseCategory category;
        private String issuingAuthority;
        @NotNull private LocalDate issueDate;
        @NotNull private LocalDate expiryDate;
        private Boolean isPrimary;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class DriverProfileUpdateRequest {
        private String fullName;
        private String phone;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverSelfCertificationRequest {
        @NotNull private DriverAggregate.DriverCertification.CertificationType certType;
        @NotBlank private String certName;
        private String issuedBy;
        @NotNull private LocalDate issueDate;
        private LocalDate expiryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverSelfLeaveRequest {
        @NotNull private DriverAggregate.DriverLeave.LeaveType leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class EligibilityCheckRequest {
        @NotNull private String employeeId;
        @NotBlank private String vehicleCategory;
        @NotNull private LocalDate tripDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InfractionRequest {
        @NotNull private UUID driverId;
        @NotNull private DriverAggregate.DriverInfraction.InfractionType infractionType;
        @NotNull private DriverAggregate.DriverInfraction.Severity severity;
        @NotNull private LocalDate incidentDate;
        private String description;
        private String penaltyNotes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LeaveApprovalRequest {
        @NotNull private DriverAggregate.DriverLeave.LeaveStatus status;
        private String approvalNotes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LeaveRequest {
        @NotNull private UUID driverId;
        @NotNull private DriverAggregate.DriverLeave.LeaveType leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        private String reason;
    }
}
