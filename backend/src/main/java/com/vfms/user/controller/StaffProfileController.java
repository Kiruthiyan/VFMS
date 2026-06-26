package com.vfms.user.controller;

import com.vfms.admin.dto.UserSummaryResponse;
import com.vfms.user.dto.StaffProfileResponse;
import com.vfms.user.dto.StaffProfileUpdateRequest;
import com.vfms.user.entity.User;
import com.vfms.user.service.StaffProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/staff-profile")
@RequiredArgsConstructor
public class StaffProfileController {

    private final StaffProfileService staffProfileService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('SYSTEM_USER')")
    public ResponseEntity<StaffProfileResponse> getMyProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(staffProfileService.getProfile(user));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('SYSTEM_USER')")
    public ResponseEntity<StaffProfileResponse> updateMyProfile(
            @AuthenticationPrincipal User user,
            @RequestBody StaffProfileUpdateRequest request) {
        return ResponseEntity.ok(staffProfileService.updateProfile(user, request));
    }

    @PostMapping("/picture")
    @PreAuthorize("hasRole('SYSTEM_USER')")
    public ResponseEntity<StaffProfileResponse> uploadProfilePicture(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(staffProfileService.replaceProfilePicture(user, file));
    }

    @DeleteMapping("/picture")
    @PreAuthorize("hasRole('SYSTEM_USER')")
    public ResponseEntity<Void> removeProfilePicture(@AuthenticationPrincipal User user) {
        staffProfileService.removeProfilePicture(user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>> getStaffList() {
        return ResponseEntity.ok(staffProfileService.getStaffList());
    }
}
