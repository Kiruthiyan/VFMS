package com.vfms.dsm.dto;

import com.vfms.common.enums.UserStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO that exposes driver-relevant fields from the users table.
 * Used by the Drivers module listing page, which shows data that was
 * entered during the admin "Create User (Driver)" workflow.
 *
 * Includes the linked driverId (from the drivers table) so that
 * the profile page can fetch driver-specific sub-resources (licenses,
 * certifications, documents, infractions, trips, etc.).
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverUserResponse {
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

    /** Auto-generated driver ID in the format DRV-XXXX */
    private String employeeId;

    /** The UUID of the linked Driver record (from the drivers table), resolved by email. May be null if no driver record exists yet. */
    private UUID driverId;
}
