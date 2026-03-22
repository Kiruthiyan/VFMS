package com.vfms.dsm.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverRequest {
    @NotBlank private String employeeId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String nic;
    private LocalDate dateOfBirth;
    private String phone;
    @Email private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String department;
    private String designation;
    private LocalDate dateOfJoining;
}
