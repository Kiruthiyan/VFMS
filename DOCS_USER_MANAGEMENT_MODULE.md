# 📚 USER MANAGEMENT MODULE - COMPREHENSIVE DOCUMENTATION

## 🎯 Module Overview
The User Management Module is responsible for managing user accounts, roles, statuses, and user-related data. It handles user entity storage, retrieval, and status management. Currently **PARTIALLY IMPLEMENTED** with entity and repository layers complete, but controller and service layers require implementation.

**Location:** `backend/src/main/java/com/vfms/user/`

---

## 📁 Module Structure

```
user/
├── entity/           # Database entities [✅ IMPLEMENTED]
│   └── User.java
├── repository/       # Database access [✅ IMPLEMENTED]
│   └── UserRepository.java
├── service/          # Business logic [❌ NOT IMPLEMENTED]
│   ├── UserService.java              (Required)
│   └── UserApprovalService.java      (Required)
├── controller/       # REST API endpoints [❌ NOT IMPLEMENTED]
│   ├── UserController.java           (Required)
│   └── AdminUserManagementController.java (Required)
└── dto/             # Data Transfer Objects [⚠️ PARTIAL]
    ├── UserProfileDto.java           (Optional)
    └── UserListDto.java              (Optional)
```

---

## 👤 1. User Entity - Complete Reference

### **User Entity Fields & Properties**

**Location:** `backend/src/main/java/com/vfms/user/entity/User.java`

Implements Spring Security's `UserDetails` interface for authentication.

```java
@Entity
@Table(name = "users")
public class User implements UserDetails {
    
    // =============== PRIMARY KEY ===============
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // =============== CORE AUTHENTICATION FIELDS ===============
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;              // BCrypt hashed
    
    @Column(nullable = false)
    private String username;              // Defaults to email
    
    // =============== PERSONAL INFORMATION ===============
    @Column(nullable = false)
    private String fullName;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String nic;                   // National ID Number
    
    // =============== ROLE & STATUS MANAGEMENT ===============
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;                    // ADMIN, APPROVER, SYSTEM_USER, DRIVER
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;            // EMAIL_UNVERIFIED, PENDING_APPROVAL, APPROVED, etc.
    
    @Column(nullable = false)
    private boolean emailVerified;        // Default: false
    
    @Column(nullable = false)
    private boolean enabled;              // Used by Spring Security, default: true
    
    // =============== ADMIN REVIEW INFORMATION ===============
    private String rejectionReason;       // If status == REJECTED
    
    private LocalDateTime reviewedAt;     // When admin reviewed
    
    // =============== DRIVER-SPECIFIC FIELDS ===============
    private String licenseNumber;
    private LocalDate licenseExpiryDate;
    private String certifications;        // Comma-separated
    private Integer experienceYears;
    
    // =============== STAFF/APPROVER-SPECIFIC FIELDS ===============
    private String employeeId;
    private String department;
    private String officeLocation;
    private String designation;
    private String approvalLevel;         // For APPROVER role
    
    // =============== TIMESTAMPS ===============
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
```

---

### **User Status Enum**

```java
public enum UserStatus {
    EMAIL_UNVERIFIED,      // Initial status after registration
    PENDING_APPROVAL,      // After email verified, awaiting admin approval
    APPROVED,              // Admin approved, user can login
    REJECTED,              // Admin rejected registration, can re-apply
    DEACTIVATED           // Admin deactivated account
}
```

---

### **Role Enum**

```java
public enum Role {
    ADMIN,         // Full system access
    APPROVER,      // Can approve requests, manage assigned users
    SYSTEM_USER,   // General system user, can access assigned resources
    DRIVER         // Can log fuel entries, view own history
}
```

---

### **User Details Implementation Methods**

```java
// Spring Security Methods
@Override
public Collection<GrantedAuthority> getAuthorities() {
    // Returns: [ROLE_DRIVER] or [ROLE_ADMIN], etc.
    return Collections.singletonList(
        new SimpleGrantedAuthority("ROLE_" + role.name())
    );
}

@Override
public String getUsername() {
    return email;  // Uses email as username
}

@Override
public boolean isAccountNonExpired() {
    return true;   // Accounts don't expire
}

@Override
public boolean isAccountNonLocked() {
    // Account locked if: DEACTIVATED or REJECTED
    return status != UserStatus.DEACTIVATED && 
           status != UserStatus.REJECTED;
}

@Override
public boolean isCredentialsNonExpired() {
    return true;   // Credentials don't expire
}

@Override
public boolean isEnabled() {
    // Only APPROVED users can login
    return status == UserStatus.APPROVED;
}
```

---

## 🗂️ 2. User Repository

**Location:** `backend/src/main/java/com/vfms/user/repository/UserRepository.java`

```java
public interface UserRepository extends JpaRepository<User, UUID> {
    
    // Find user by email
    Optional<User> findByEmail(String email);
    
    // Check if email exists
    boolean existsByEmail(String email);
    
    // Find all users by status, ordered by creation date
    List<User> findByStatusOrderByCreatedAtAsc(UserStatus status);
}
```

---

## 📋 3. User Entity Relationships

### **Current Relationships:**

```
User (1) ←→ (Many) OtpVerification
           └─ Foreign Key: email

User (1) ←→ (1) EmailVerificationToken
           └─ Unique Foreign Key

User (1) ←→ (1) PasswordResetToken
           └─ Unique Foreign Key

User (1) ←→ (Many) RefreshToken
           └─ Foreign Key

User (1) ←→ (Many) FuelRecord (TODO: when fuel module implemented)
           └─ Foreign Key
```

---

## 🔄 4. User Status Lifecycle

```
REGISTRATION FLOW:
┌─────────────────────────────────────────────────────────────┐
│                    USER STATUS LIFECYCLE                     │
└─────────────────────────────────────────────────────────────┘

1. USER REGISTRATION
   ↓
   Status: EMAIL_UNVERIFIED
   Action: Send verification email

2. EMAIL VERIFICATION
   ↓
   Status: PENDING_APPROVAL (emailVerified=true)
   Action: Wait for admin review

3a. ADMIN APPROVAL                    3b. ADMIN REJECTION
   ↓                                     ↓
   Status: APPROVED                      Status: REJECTED
   Action: User can login                Action: User blocked, can re-apply
   emailVerified=true                    rejectionReason set
   enabled=true                          reviewedAt set

4. ACCOUNT DEACTIVATION (by admin)
   ↓
   Status: DEACTIVATED
   Action: User cannot login
   enabled=true, but status check prevents login
```

---

## 📊 5. User Data by Role

### **DRIVER Role**
```json
{
  "id": "uuid",
  "email": "driver@example.com",
  "fullName": "John Doe",
  "phone": "+1234567890",
  "nic": "12345-6789",
  "role": "DRIVER",
  "status": "APPROVED",
  "emailVerified": true,
  "enabled": true,
  "licenseNumber": "DL123456",
  "licenseExpiryDate": "2026-12-31",
  "certifications": "Heavy Vehicle, Passenger",
  "experienceYears": 5,
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00"
}
```

### **APPROVER Role**
```json
{
  "id": "uuid",
  "email": "approver@example.com",
  "fullName": "Jane Smith",
  "phone": "+1234567890",
  "nic": "12345-6789",
  "role": "APPROVER",
  "status": "APPROVED",
  "emailVerified": true,
  "enabled": true,
  "employeeId": "EMP-001",
  "department": "Fleet Management",
  "officeLocation": "Head Office",
  "designation": "Senior Manager",
  "approvalLevel": "LEVEL_2",
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00"
}
```

### **SYSTEM_USER Role**
```json
{
  "id": "uuid",
  "email": "sysuser@example.com",
  "fullName": "Bob Johnson",
  "phone": "+1234567890",
  "nic": "12345-6789",
  "role": "SYSTEM_USER",
  "status": "APPROVED",
  "emailVerified": true,
  "enabled": true,
  "employeeId": "EMP-002",
  "department": "Operations",
  "officeLocation": "Branch Office",
  "designation": "Operations Officer",
  "createdAt": "2026-01-15T10:30:00",
  "updatedAt": "2026-01-15T10:30:00"
}
```

### **ADMIN Role**
```json
{
  "id": "uuid",
  "email": "admin@example.com",
  "fullName": "Alice Cooper",
  "phone": "+1234567890",
  "nic": "12345-6789",
  "role": "ADMIN",
  "status": "APPROVED",
  "emailVerified": true,
  "enabled": true,
  "employeeId": "EMP-000",
  "department": "Administration",
  "createdAt": "2026-01-01T00:00:00",
  "updatedAt": "2026-01-01T00:00:00"
}
```

---

## 🛠️ 6. Planned Services (Not Implemented)

### **UserService** (Required)

```java
public interface UserService {
    
    // Retrieve user information
    User getUserById(UUID userId);
    User getUserByEmail(String email);
    List<UserDto> getAllUsers();
    List<UserDto> getUsersByRole(Role role);
    List<UserDto> getUsersByStatus(UserStatus status);
    
    // Update user information
    User updateUserProfile(UUID userId, UpdateUserProfileRequest request);
    User updateUserRole(UUID userId, Role newRole);
    User updateUserStatus(UUID userId, UserStatus newStatus);
    
    // User lookup
    boolean userExists(UUID userId);
    boolean emailExists(String email);
    
    // Delete operations
    void deactivateUser(UUID userId);
    void deleteUser(UUID userId);  // Hard delete - careful!
}
```

---

### **UserApprovalService** (Required)

```java
public interface UserApprovalService {
    
    // Get pending approvals
    List<UserDto> getPendingApprovals();
    int getPendingApprovalsCount();
    
    // Approve user
    void approveUser(UUID userId);
    void approveUser(UUID userId, String approverNotes);
    
    // Reject user
    void rejectUser(UUID userId, String rejectionReason);
    
    // Get approved users
    List<UserDto> getApprovedUsers();
    
    // Resubmit rejected application
    void allowResubmission(UUID userId);
}
```

---

## 🔌 7. Planned Controllers (Not Implemented)

### **UserController** - User self-service endpoints

```java
@RestController
@RequestMapping("/api/user")
public class UserController {
    
    // Get current user profile
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserProfileDto> getCurrentProfile() { }
    
    // Update own profile
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<UserProfileDto> updateProfile(
        @Valid @RequestBody UpdateProfileRequest request) { }
    
    // Get pending users (for APPROVER role)
    @GetMapping("/pending")
    @PreAuthorize("hasRole('APPROVER') or hasRole('ADMIN')")
    public ApiResponse<List<UserDto>> getPendingUsers() { }
}
```

---

### **AdminUserManagementController** - Admin user management

```java
@RestController
@RequestMapping("/api/admin/users")
public class AdminUserManagementController {
    
    // List all users with pagination
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<UserDto>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size) { }
    
    // Get user by ID
    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserDetailDto> getUserById(@PathVariable UUID userId) { }
    
    // Get users by role
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserDto>> getUsersByRole(@PathVariable Role role) { }
    
    // Get users by status
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserDto>> getUsersByStatus(@PathVariable UserStatus status) { }
    
    // Approve user
    @PostMapping("/{userId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> approveUser(@PathVariable UUID userId) { }
    
    // Reject user with reason
    @PostMapping("/{userId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> rejectUser(
        @PathVariable UUID userId,
        @RequestBody RejectUserRequest request) { }
    
    // Deactivate user
    @PostMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deactivateUser(@PathVariable UUID userId) { }
    
    // Activate deactivated user
    @PostMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> activateUser(@PathVariable UUID userId) { }
    
    // Get approval statistics
    @GetMapping("/stats/approvals")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ApprovalStatsDto> getApprovalStats() { }
}
```

---

## 📝 8. Planned DTOs (Not Implemented)

### **UserProfileDto**
```java
@Data
public class UserProfileDto {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String nic;
    private Role role;
    private UserStatus status;
    private boolean emailVerified;
    
    // Role-specific fields (conditionally included)
    private DriverDetailsDto driverDetails;      // If DRIVER
    private StaffDetailsDto staffDetails;        // If APPROVER/SYSTEM_USER
}
```

---

### **UserListDto**
```java
@Data
public class UserListDto {
    private UUID id;
    private String email;
    private String fullName;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### **UserDetailDto**
```java
@Data
public class UserDetailDto {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private String nic;
    private Role role;
    private UserStatus status;
    private boolean emailVerified;
    private boolean enabled;
    private String rejectionReason;
    private LocalDateTime reviewedAt;
    
    // Role-specific details
    private DriverDetailsDto driverDetails;
    private StaffDetailsDto staffDetails;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### **UpdateProfileRequest**
```java
@Data
public class UpdateProfileRequest {
    @NotBlank
    private String fullName;
    
    @Pattern(regexp = "^[0-9\\-\\+]{10,}$")
    private String phone;
    
    // Driver-specific updates
    private LocalDate licenseExpiryDate;
    private String certifications;
    private Integer experienceYears;
    
    // Staff-specific updates
    private String department;
    private String officeLocation;
    private String designation;
}
```

---

## 🔐 9. Security & Permissions

### **Role-Based Access Control (RBAC)**

```
ADMIN
├─ View all users
├─ Approve/Reject registrations
├─ Deactivate users
├─ View all roles
└─ Full system access

APPROVER
├─ View own profile
├─ View assigned users
├─ Approve assigned requests
└─ Limited system access

SYSTEM_USER
├─ View own profile
├─ Access assigned resources
└─ Read-only system access

DRIVER
├─ View own profile
├─ Log fuel entries
├─ View own fuel history
└─ Limited fuel module access
```

---

### **Account Status Permissions**

```
EMAIL_UNVERIFIED  → Cannot login
PENDING_APPROVAL  → Cannot login
APPROVED          → Full access
REJECTED          → Cannot login, can re-apply
DEACTIVATED       → Cannot login, cannot re-activate self
```

---

## 📊 10. Database Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) DEFAULT email,
    
    -- Personal Info
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    nic VARCHAR(50) NOT NULL,
    
    -- Role & Status
    role VARCHAR(50) NOT NULL DEFAULT 'SYSTEM_USER',
    status VARCHAR(50) NOT NULL DEFAULT 'EMAIL_UNVERIFIED',
    email_verified BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    
    -- Admin Review
    rejection_reason TEXT,
    reviewed_at TIMESTAMP,
    
    -- Driver Fields
    license_number VARCHAR(50),
    license_expiry_date DATE,
    certifications TEXT,
    experience_years INTEGER,
    
    -- Staff Fields
    employee_id VARCHAR(50),
    department VARCHAR(100),
    office_location VARCHAR(100),
    designation VARCHAR(100),
    approval_level VARCHAR(50),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

---

## 🔄 11. User Lifecycle Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE USER LIFECYCLE                      │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   ├─ User submits registration form
   ├─ Status: EMAIL_UNVERIFIED
   └─ Email verification link sent

2. EMAIL VERIFICATION
   ├─ User clicks verification link
   ├─ Status: PENDING_APPROVAL
   ├─ emailVerified: true
   └─ Waiting for admin review

3. ADMIN REVIEW (Two paths)
   │
   ├─ APPROVE PATH
   │  ├─ Admin reviews application
   │  ├─ Status: APPROVED
   │  ├─ Approval email sent
   │  └─ User can now login
   │
   └─ REJECT PATH
      ├─ Admin reviews application
      ├─ Status: REJECTED
      ├─ rejectionReason set
      ├─ Rejection email sent
      └─ User can re-apply (optional)

4. ACTIVE USER (APPROVED)
   ├─ User logs in with email + password
   ├─ JWT tokens generated
   ├─ Can access role-specific features
   └─ Can update profile and change password

5. ACCOUNT DEACTIVATION (Admin)
   ├─ Admin deactivates account
   ├─ Status: DEACTIVATED
   ├─ User cannot login
   └─ Can be re-activated by admin

6. DATA RETENTION
   ├─ User account data retained
   ├─ Audit trail maintained
   ├─ Can be permanently deleted (if needed)
   └─ Historical data preserved
```

---

## 📋 12. Common Queries

### **Find Users by Status**
```java
List<User> pendingUsers = userRepository
    .findByStatusOrderByCreatedAtAsc(UserStatus.PENDING_APPROVAL);
```

### **Find User by Email**
```java
Optional<User> user = userRepository.findByEmail("user@example.com");
```

### **Check if Email Exists**
```java
boolean exists = userRepository.existsByEmail("user@example.com");
```

### **Get User's Authority**
```java
User user = ...; // fetched from DB
Collection<GrantedAuthority> authorities = user.getAuthorities();
// Returns: [ROLE_DRIVER]
```

---

## ⚠️ 13. Implementation Gaps

**IMPLEMENTED:**
- ✅ User entity with all fields
- ✅ User repository with basic queries
- ✅ Spring Security UserDetails implementation
- ✅ User role-based permissions

**NOT IMPLEMENTED:**
- ❌ UserService (business logic layer)
- ❌ UserApprovalService (approval workflow)
- ❌ UserController (self-service endpoints)
- ❌ AdminUserManagementController (admin endpoints)
- ❌ Pagination for user lists
- ❌ User search/filtering
- ❌ User edit endpoints
- ❌ User audit logging
- ❌ User statistics/reporting
- ❌ Bulk user operations
- ❌ User export functionality

---

## 🚀 14. Future Enhancements

1. **User Search**
   - Search by email, name, phone
   - Filter by role, status, department
   - Advanced filtering options

2. **Bulk Operations**
   - Bulk approve users
   - Bulk reject users
   - Bulk status updates
   - Bulk deactivation

3. **Audit Logging**
   - Track status changes
   - Track admin actions
   - User activity logs
   - Approval audit trail

4. **Reports**
   - User statistics dashboard
   - Approval queue reports
   - Role distribution
   - Registration trends

5. **Advanced Features**
   - User impersonation (admin)
   - Temporary account suspension
   - Scheduled deactivation
   - Account recovery

---

## 📌 Key Takeaways

1. **User is core entity** - All other modules reference User
2. **Status controls access** - Only APPROVED users can login
3. **Role controls permissions** - Defines what user can do
4. **Multi-step onboarding** - Register → Verify Email → Admin Approval → Login
5. **Role-specific fields** - Different roles have different data
6. **Spring Security integration** - UserDetails implementation for authentication
7. **Email is unique** - No two users with same email
8. **Soft deactivation** - User record not deleted, just deactivated
9. **Service layer missing** - Needs implementation for business logic
10. **Controller layer missing** - Needs REST endpoints for user management

---

## 🔗 Related Modules

- **Auth Module** - Uses User entity for authentication
- **Fuel Module** - Will reference User (driver) for fuel entries
- **Admin Module** - Will manage user approvals (TODO)
- **Security Config** - Uses User's role-based authorities
- **Custom User Details Service** - Loads User from database

---

*Last Updated: April 2026*
*Version: 1.0*
*Status: Entity & Repository Complete | Service & Controller Pending*
