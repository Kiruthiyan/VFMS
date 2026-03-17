package com.vfms.auth.dto;

import com.vfms.auth.model.User;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class UserResponse {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String role;
    private Boolean status;
    private LocalDate joinedDate;
    private String licenseNumber;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus())
                .joinedDate(user.getJoinedDate())
                .licenseNumber(user.getLicenseNumber())
                .build();
    }
}
