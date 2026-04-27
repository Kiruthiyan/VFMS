package com.vfms.user.controller;

import com.vfms.auth.dto.AuthResponse;
import com.vfms.auth.service.AuthService;
import com.vfms.common.dto.ApiResponse;
import com.vfms.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                ApiResponse.success("Current user fetched successfully", authService.getCurrentUser(user))
        );
    }
}
