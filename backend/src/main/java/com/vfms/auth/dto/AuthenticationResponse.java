package com.vfms.auth.dto;

import com.vfms.auth.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private String role;
    private String name;
    private String email;
    private Integer id;
    private String generatedPassword; // Only for admin user creation response
    private boolean passwordChangeRequired;
}
