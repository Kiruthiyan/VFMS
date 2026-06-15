package com.vfms.dsm.dto;

import com.vfms.common.enums.UserStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO that exposes driver-relevant fields from the users table.
 * Drivers are users with {@code Role.DRIVER}; {@code driverId} is the same UUID as {@code id}.
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

    /** Same UUID as {@link #id} — used by sub-resource APIs (licenses, documents, etc.). */
    private UUID driverId;
}
