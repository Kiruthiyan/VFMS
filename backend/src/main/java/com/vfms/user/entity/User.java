package com.vfms.user.entity;

import com.vfms.common.enums.Role;
import com.vfms.common.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // ── COMMON FIELDS ─────────────────────────────────────────────────────

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Column(nullable = false)
    private String nic;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Column(nullable = false)
    private boolean emailVerified = false;

    // ── ADMIN REVIEW FIELDS ───────────────────────────────────────────────

    private LocalDateTime reviewedAt;

    private String rejectionReason;

    // ── ADMIN-CREATED USER FLAGS ──────────────────────────────────────────

    @Builder.Default
    @Column(nullable = false)
    private boolean createdByAdmin = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean passwordChangeRequired = false;

    // ── SOFT DELETE FIELDS ────────────────────────────────────────────────

    private LocalDateTime deletedAt;

    private String deletedReason;

    @Enumerated(EnumType.STRING)
    private UserStatus statusBeforeDeletion;

    // ── AUDIT TRAIL FIELDS ────────────────────────────────────────────────

    private String createdBy;

    private String deletedBy;

    private String restoredBy;

    // ── DRIVER-SPECIFIC FIELDS ────────────────────────────────────────────

    private String licenseNumber;

    private LocalDate licenseExpiryDate;

    private String certifications;

    @Column(name = "experience_years")
    private Integer experienceYears;

    // ── STAFF / APPROVER FIELDS ───────────────────────────────────────────

    private String employeeId;

    private String department;

    private String officeLocation;

    private String designation;

    private String approvalLevel;

    // ── TIMESTAMPS ────────────────────────────────────────────────────────

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
