package com.vfms.rental.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDto {
    @NotBlank(message = "Vendor name is required")
    private String name;

    private String contactPerson;
    private String phone;
    private String email;
    private String address;
}
