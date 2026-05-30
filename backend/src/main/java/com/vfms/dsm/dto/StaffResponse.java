package com.vfms.dsm.dto;

import com.vfms.dsm.entity.Staff;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffResponse {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String nic;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private LocalDate dateOfJoining;
    private Staff.StaffRole role;
    private Staff.StaffStatus status;
    private LocalDateTime createdAt;
}
