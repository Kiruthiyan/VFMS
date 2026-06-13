package com.vfms.user.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class StaffProfileUpdateRequest {
    private String phone;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
