package com.vfms.dsm.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.vfms.common.json.NullableLocalDateDeserializer;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DriverRequest {
    @NotBlank private String employeeId;
    @NotBlank private String firstName;
    @NotBlank private String lastName;
    @NotBlank private String nic;
    @JsonDeserialize(using = NullableLocalDateDeserializer.class)
    private LocalDate dateOfBirth;
    @NotBlank private String phone;
    @NotBlank private String licenseNumber;
    @NotNull
    @JsonDeserialize(using = NullableLocalDateDeserializer.class)
    private LocalDate licenseExpiryDate;
    @Email private String email;
    private String address;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String department;
    private String designation;
    @JsonDeserialize(using = NullableLocalDateDeserializer.class)
    private LocalDate dateOfJoining;
}
