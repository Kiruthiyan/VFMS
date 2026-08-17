package com.vfms.dsm.dto;

import com.vfms.dsm.entity.DriverAggregate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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
        @NotBlank @Size(max = 150) private String certName;
        @Size(max = 150) private String issuedBy;
        @NotNull private LocalDate issueDate;
        private LocalDate expiryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverLicenseRequest {
        @NotNull private UUID driverId;
        @NotBlank @Pattern(regexp = "(?i)^[A-Z0-9]{6,20}$", message = "License number must be 6-20 alphanumeric characters.")
        private String licenseNumber;
        @NotNull private DriverAggregate.DriverLicense.LicenseCategory category;
        @Size(max = 150) private String issuingAuthority;
        @NotNull private LocalDate issueDate;
        @NotNull private LocalDate expiryDate;
        private Boolean isPrimary;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class DriverProfileUpdateRequest {
        @Size(max = 100) private String fullName;
        @Pattern(regexp = "^$|^(?:\\+94|0)(70|71|72|74|75|76|77|78)\\d{7}$", message = "Please enter a valid phone number.")
        private String phone;
        @Size(max = 500) private String address;
        @Size(max = 100) private String emergencyContactName;
        @Pattern(regexp = "^$|^(?:\\+94|0)(70|71|72|74|75|76|77|78)\\d{7}$", message = "Please enter a valid phone number.")
        private String emergencyContactPhone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverSelfCertificationRequest {
        @NotNull private DriverAggregate.DriverCertification.CertificationType certType;
        @NotBlank @Size(max = 150) private String certName;
        @Size(max = 150) private String issuedBy;
        @NotNull private LocalDate issueDate;
        private LocalDate expiryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverSelfLeaveRequest {
        @NotNull private DriverAggregate.DriverLeave.LeaveType leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        @Size(max = 1000) private String reason;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class EligibilityCheckRequest {
        @NotBlank private String employeeId;
        @NotBlank private String vehicleCategory;
        @NotNull private LocalDate tripDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InfractionRequest {
        @NotNull private UUID driverId;
        @NotNull private DriverAggregate.DriverInfraction.InfractionType infractionType;
        @NotNull private DriverAggregate.DriverInfraction.Severity severity;
        @NotNull @PastOrPresent(message = "Incident date cannot be in the future.")
        private LocalDate incidentDate;
        @Size(max = 1000) private String description;
        @Size(max = 500) private String penaltyNotes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class LeaveApprovalRequest {
        @NotNull private DriverAggregate.DriverLeave.LeaveStatus status;
        @Size(max = 1000) private String approvalNotes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LeaveRequest {
        @NotNull private UUID driverId;
        @NotNull private DriverAggregate.DriverLeave.LeaveType leaveType;
        @NotNull private LocalDate startDate;
        @NotNull private LocalDate endDate;
        @Size(max = 1000) private String reason;
    }
}
