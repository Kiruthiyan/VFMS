package com.vfms.user.entity;

import com.vfms.common.enums.Role;

import com.vfms.common.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * User Entity representing a system user with authentication capabilities.
 * Implements Spring Security's UserDetails for RBAC (Role Based Access
 * Control).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
=======
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
    >>>>>>>origin/feature/user-management

    @Id @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;

    <<<<<<<HEAD<<<<<<<HEAD @Column(nullable=false,unique=true)
    private String username; // email address

    @Column(nullable = false)
    private String password;=======
    // ── COMMON FIELDS ─────────────────────────────────────────────────────
    >>>>>>>origin/feature/user-auth=======
    // ── COMMON FIELDS ─────────────────────────────────────────────────────
    >>>>>>>origin/feature/user-management

    @Column(nullable=false)
    private String fullName;

    <<<<<<<HEAD @Column(nullable=false,unique=true)
    private String email;

    <<<<<<<HEAD=======
    @Column(nullable = false)
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String username;

    @PrePersist
    protected void onCreate() {
        if (this.username == null) {
            this.username = this.email; // Fallback username to email for DB constraints
        }
    }=======

    @Column(nullable = false)
    private String email;>>>>>>>origin/feature/user-management

    @Column(nullable=false)
    private String password;

    <<<<<<<HEAD @Column(nullable=false)=======>>>>>>>origin/feature/user-management
    private String phone;

    @Column(nullable = false)
    private String nic;

    <<<<<<<HEAD>>>>>>>origin/feature/user-auth=======>>>>>>>origin/feature/user-management @Enumerated(EnumType.STRING)@Column(nullable=false)
    private Role role;

    <<<<<<<HEAD<<<<<<<HEAD @Column(name="is_active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "is_email_verified")
    @Builder.Default
    private boolean emailVerified = false;

    =======
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.EMAIL_UNVERIFIED;

    @Builder.Default
    @Column(nullable = false, name = "email_verified")
    private boolean emailVerified = false;

    @Builder.Default
    @Column(nullable = false, name = "enabled")
    @Getter(AccessLevel.NONE)
    private boolean enabled = true;

    // ── ADMIN REVIEW FIELDS ───────────────────────────────────────────────

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // ── DRIVER-SPECIFIC FIELDS ────────────────────────────────────────────

    @Column(name = "license_number")
    private String licenseNumber;

    @Column(name = "license_expiry_date")
=======
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

    >>>>>>>origin/feature/user-management
    private LocalDate licenseExpiryDate;

    private String certifications;

    @Column(name = "experience_years")
    private Integer experienceYears;

    <<<<<<<HEAD
    // ── STAFF / APPROVER-SPECIFIC FIELDS ─────────────────────────────────

    @Column(name="employee_id")=======
    // ── STAFF / APPROVER FIELDS ───────────────────────────────────────────

    >>>>>>>origin/feature/user-management
    private String employeeId;

    private String department;

    <<<<<<<HEAD @Column(name="office_location")=======>>>>>>>origin/feature/user-management
    private String officeLocation;

    private String designation;

    <<<<<<<HEAD @Column(name="approval_level")=======>>>>>>>origin/feature/user-management
    private String approvalLevel;

    // ── TIMESTAMPS ────────────────────────────────────────────────────────

    <<<<<<<HEAD>>>>>>>origin/feature/user-auth @CreationTimestamp @Column(updatable=false,name="created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    <<<<<<<HEAD
    // ────── UserDetails Implementation ─────────────────────────────────
    =======
    // ── SPRING SECURITY ───────────────────────────────────────────────────
    >>>>>>>origin/feature/user-auth

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
<<<<<<< HEAD
=======
    public String getUsername() {
        return email;
    }

    @Override
>>>>>>> origin/feature/user-auth
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
<<<<<<< HEAD
        return active;
=======
        return status != UserStatus.DEACTIVATED && status != UserStatus.REJECTED;
>>>>>>> origin/feature/user-auth
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
<<<<<<< HEAD
        return active;
=======
        return status == UserStatus.APPROVED;
>>>>>>> origin/feature/user-auth
=======

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
>>>>>>> origin/feature/user-management
    }
}
