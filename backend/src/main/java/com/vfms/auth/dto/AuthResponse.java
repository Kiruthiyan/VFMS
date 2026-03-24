package com.vfms.auth.dto;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UUID userId;
    private String fullName;
    private String email;
    private Role role;
    private UserStatus status;
}
