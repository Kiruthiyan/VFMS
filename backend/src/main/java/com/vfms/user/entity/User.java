package com.vfms.user.entity;

import com.vfms.common.enums.Role;
<<<<<<< HEAD
=======
import com.vfms.common.enums.UserStatus;
>>>>>>> origin/feature/user-auth
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

<<<<<<< HEAD
=======
import java.time.LocalDate;
>>>>>>> origin/feature/user-auth
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

<<<<<<< HEAD
/**
 * User Entity representing a system user with authentication capabilities.
 * Implements Spring Security's UserDetails for RBAC (Role Based Access
 * Control).
 */
=======
>>>>>>> origin/feature/user-auth
@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

<<<<<<< HEAD
    @Column(nullable = false, unique = true)
    private String username; // email address

    @Column(nullable = false)
    private String password;
=======
    // ── COMMON FIELDS ─────────────────────────────────────────────────────
>>>>>>> origin/feature/user-auth

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

<<<<<<< HEAD
=======
    @Column(nullable = false)
    @Getter(AccessLevel.NONE)
    @Setter(AccessLevel.NONE)
    private String username;

    @PrePersist
    protected void onCreate() {
        if (this.username == null) {
            this.username = this.email; // Fallback username to email for DB constraints
        }
    }

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String nic;

>>>>>>> origin/feature/user-auth
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

<<<<<<< HEAD
    @Column(name = "is_active")
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
    private LocalDate licenseExpiryDate;

    private String certifications;

    @Column(name = "experience_years")
    private Integer experienceYears;

    // ── STAFF / APPROVER-SPECIFIC FIELDS ─────────────────────────────────

    @Column(name = "employee_id")
    private String employeeId;

    private String department;

    @Column(name = "office_location")
    private String officeLocation;

    private String designation;

    @Column(name = "approval_level")
    private String approvalLevel;

    // ── TIMESTAMPS ────────────────────────────────────────────────────────

>>>>>>> origin/feature/user-auth
    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

<<<<<<< HEAD
    // ────── UserDetails Implementation ─────────────────────────────────
=======
    // ── SPRING SECURITY ───────────────────────────────────────────────────
>>>>>>> origin/feature/user-auth

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
    }
}
