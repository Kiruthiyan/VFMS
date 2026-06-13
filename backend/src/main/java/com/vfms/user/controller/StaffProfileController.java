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
import com.vfms.dsm.service.DriverSelfService; // Assuming we can reuse Document upload logic

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/staff-profile")
@RequiredArgsConstructor
public class StaffProfileController {

    private final StaffProfileService staffProfileService;
    private final DriverSelfService driverSelfService; // Using this to upload to supabase for now

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
            @RequestParam("file") MultipartFile file) throws IOException {
        
        // We reuse the driver self service method which uploads documents to Supabase
        com.vfms.dsm.entity.DriverDocument doc = driverSelfService.uploadMyDocument(
                user.getEmail(), file, com.vfms.dsm.entity.DriverDocument.DocumentEntityType.PROFILE, null);
        
        staffProfileService.updateProfilePicture(user, doc.getFileUrl());
        return ResponseEntity.ok(staffProfileService.getProfile(user));
    }

    @GetMapping("/list")
    @PreAuthorize("hasAnyRole('APPROVER', 'ADMIN')")
    public ResponseEntity<List<UserSummaryResponse>> getStaffList() {
        return ResponseEntity.ok(staffProfileService.getStaffList());
    }
}
