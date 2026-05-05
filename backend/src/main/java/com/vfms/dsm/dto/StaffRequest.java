package com.vfms.dsm.dto;

import com.vfms.dsm.entity.Staff;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StaffRequest {
    @NotBlank private String employeeId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    private String nic;
    @Email private String email;
    private String phone;
    private String department;
    private String designation;
    private LocalDate dateOfJoining;
    private Staff.StaffRole role;
}
