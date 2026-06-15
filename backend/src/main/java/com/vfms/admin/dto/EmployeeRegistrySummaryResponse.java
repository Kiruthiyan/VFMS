package com.vfms.admin.dto;

import lombok.Builder;
import lombok.Value;

import java.util.UUID;

@Value
@Builder
public class EmployeeRegistrySummaryResponse {
    UUID id;
    String employeeId;
    String fullName;
    String email;
    String phone;
    String nic;
    String department;
    String designation;
    String officeLocation;
    boolean active;
}
