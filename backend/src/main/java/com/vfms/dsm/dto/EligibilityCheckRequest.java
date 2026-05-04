package com.vfms.dsm.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EligibilityCheckRequest {
    @NotNull
    private String employeeId;

    @NotBlank
    private String vehicleCategory;

    @NotNull
    private LocalDate tripDate;
}
