package com.vfms.dsm.dto;

import com.vfms.dsm.entity.Driver;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String nic;
    private LocalDate dateOfBirth;
    private String phone;
    private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String department;
    private String designation;
    private LocalDate dateOfJoining;
    private String photoUrl;
    private Driver.DriverStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
