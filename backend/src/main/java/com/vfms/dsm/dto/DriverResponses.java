package com.vfms.dsm.dto;

import com.vfms.common.enums.UserStatus;
import com.vfms.dsm.entity.DriverAggregate;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/** Response contracts for all DSM endpoints. */
public final class DriverResponses {
    private DriverResponses() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverComplianceResponse {
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

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverLicenseResponse {
        private Long id;
        private UUID driverId;
        private String driverName;
        private String licenseNumber;
        private DriverAggregate.DriverLicense.LicenseCategory category;
        private String issuingAuthority;
        private LocalDate issueDate;
        private LocalDate expiryDate;
        private String documentUrl;
        private Boolean isPrimary;
        private DriverAggregate.DriverLicense.LicenseStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverResponse {
        private UUID id;
        private String employeeId;
        private String firstName;
        private String lastName;
        private String nic;
        private LocalDate dateOfBirth;
        private String phone;
        private String licenseNumber;
        private LocalDate licenseExpiryDate;
        private String email;
        private String address;
        private String emergencyContactName;
        private String emergencyContactPhone;
        private String department;
        private String designation;
        private LocalDate dateOfJoining;
        private String photoUrl;
        private UserStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        /**
         * Driver rating as a percentage from 0 to 100.
         * Reserved for Trip Scheduling / Staff Dashboard integration.
         */
        private Integer ratingPercentage;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverUserResponse {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private String nic;
        private String licenseNumber;
        private LocalDate licenseExpiryDate;
        private String certifications;
        private Integer experienceYears;
        private UserStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private String employeeId;
        private UUID driverId;
        /**
         * Driver rating as a percentage from 0 to 100.
         * Reserved for Trip Scheduling / Staff Dashboard integration.
         */
        private Integer ratingPercentage;
        /**
         * Driver feedback entries from Trip Scheduling / Staff Dashboard.
         * Empty until that module starts publishing feedback.
         */
        private List<DriverFeedbackResponse> feedbacks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DriverFeedbackResponse {
        private UUID id;
        private Integer ratingPercentage;
        private String feedback;
        private String comment;
        private String givenBy;
        private LocalDateTime createdAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EligibilityCheckResponse {
        private UUID driverId;
        private String vehicleCategory;
        private boolean eligible;
        private List<String> reasons;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class QualificationCheckResponse {
        private UUID driverId;
        private String vehicleCategory;
        private boolean qualified;
        private List<String> reasons;
    }
}
