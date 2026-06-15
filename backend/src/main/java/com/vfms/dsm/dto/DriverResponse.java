package com.vfms.dsm.dto;

import com.vfms.common.enums.UserStatus;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverResponse {
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
}
