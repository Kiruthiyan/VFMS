package com.vfms.dsm.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for driver self-service profile updates.
 * Only fields the driver is permitted to edit are included here;
 * all other Driver fields (NIC, employeeId, status, etc.) are intentionally absent.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DriverProfileUpdateRequest {
    private String phone;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
}
