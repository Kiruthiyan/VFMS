package com.vfms.admin.controller;

import com.vfms.admin.dto.CreateUserRequest;
import com.vfms.admin.dto.ReviewDecision;
import com.vfms.admin.dto.ReviewUserRequest;
import com.vfms.admin.dto.SoftDeleteRequest;
import com.vfms.admin.dto.UpdateUserRequest;
import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.admin.service.AdminUserService;
import com.vfms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @PostMapping
    public ResponseEntity<UserSummaryResponse> createUser(
            @Valid @RequestBody CreateUserRequest request) {
        UserSummaryResponse created = adminUserService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UserSummaryResponse>> getPendingUsers() {
        return ResponseEntity.ok(adminUserService.getPendingUsers());
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<UserSummaryResponse>> getDeletedUsers() {
        return ResponseEntity.ok(adminUserService.getDeletedUsers());
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        return ResponseEntity.ok(adminUserService.getUserCounts());
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserSummaryResponse> getUser(
            @PathVariable UUID userId) {
        return ResponseEntity.ok(adminUserService.getUserById(userId));
    }

    @PostMapping("/{userId}/review")
    public ResponseEntity<ApiResponse<Void>> reviewUser(
            @PathVariable UUID userId,
            @Valid @RequestBody ReviewUserRequest request) {
        adminUserService.reviewUser(userId, request);

        String message = request.getDecision() == ReviewDecision.APPROVE
                ? "User approved successfully."
                : "User rejected.";

        return ResponseEntity.ok(ApiResponse.success(message, null));
    }

    @PatchMapping("/{userId}/soft-delete")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(
            @PathVariable UUID userId,
            @Valid @RequestBody SoftDeleteRequest request) {
        adminUserService.softDeleteUser(userId, request);
        return ResponseEntity.ok(
                ApiResponse.success("User has been deleted.", null));
    }

    @PostMapping("/{userId}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreUser(
            @PathVariable UUID userId) {
        adminUserService.restoreUser(userId);
        return ResponseEntity.ok(
                ApiResponse.success("User has been restored.", null));
    }

    @PatchMapping("/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable UUID userId) {
        adminUserService.toggleUserStatus(userId);
        return ResponseEntity.ok(
                ApiResponse.success("User status updated.", null));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserSummaryResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(
                adminUserService.updateUser(userId, request));
    }
}
