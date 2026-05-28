package com.vfms.admin.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class VerifiedStaffProfileResponse {
    String employeeId;
    String fullName;
    String email;
    String phone;
    String nic;
    String department;
    String designation;
    String officeLocation;
}
