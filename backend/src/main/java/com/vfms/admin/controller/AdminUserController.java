package com.vfms.admin.controller;

import com.vfms.admin.dto.ReviewUserRequest;
import com.vfms.admin.dto.UpdateUserRequest;
import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.admin.service.AdminUserService;
import com.vfms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // GET all users
    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    // GET pending users only
    @GetMapping("/pending")
    public ResponseEntity<List<UserSummaryResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminUserService.getPendingUsers());
    }

    // GET single user
    @GetMapping("/{userId}")
    public ResponseEntity<UserSummaryResponse> getUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(adminUserService.getUserById(userId));
    }

    // POST approve or reject
    @PostMapping("/{userId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewUser(
            @PathVariable UUID userId,
            @Valid @RequestBody ReviewUserRequest request) {
        adminUserService.reviewUser(userId, request);

        String message = "APPROVE".equalsIgnoreCase(request.getDecision())
                ? "User approved successfully."
                : "User rejected.";

        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    // PATCH deactivate or reactivate
    @PatchMapping("/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable UUID userId) {
        adminUserService.toggleUserStatus(userId);
        return ResponseEntity.ok(
                ApiResponse.success("User status updated.", null));
    }

    // PUT update user details
    @PutMapping("/{userId}")
    public ResponseEntity<UserSummaryResponse> updateUser(
            @PathVariable UUID userId,
            @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                adminUserService.updateUser(userId, request));
    }
}
