package com.vfms.user.dto;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class StaffProfileResponse {
    private UUID id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String nic;
    private Role role;
    private UserStatus status;
    private String department;
    private String designation;
    private String officeLocation;
    private String photoUrl;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
