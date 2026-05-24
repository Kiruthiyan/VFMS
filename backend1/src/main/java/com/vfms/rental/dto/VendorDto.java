package com.vfms.rental.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorDto {
    @NotBlank(message = "Vendor name is required")
    private String name;

    @Size(max = 100, message = "Contact person name is too long")
    private String contactPerson;

    @Pattern(regexp = "^07\\d{8}$", message = "Enter a valid Sri Lankan number (e.g. 0771234567)")
    private String phone;

    @Email(regexp = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$", message = "Enter a valid email")
    private String email;

    @Size(max = 255, message = "Address is too long")
    private String address;
}
