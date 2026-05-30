package com.vfms.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DriverOptionDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String employeeId;
}
