# 📚 USER AUTHENTICATION MODULE - COMPREHENSIVE DOCUMENTATION

## 🎯 Module Overview
The User Authentication Module handles all authentication operations including user registration, login, email verification, OTP management, and password reset functionality. It uses JWT tokens for stateless authentication.

**Location:** `backend/src/main/java/com/vfms/auth/`

---

## 📁 Module Structure

```
auth/
├── controller/        # REST API endpoints
│   ├── AuthController.java
│   └── PasswordController.java
├── service/          # Business logic
│   ├── AuthService.java
│   ├── OtpService.java
│   ├── EmailService.java
│   ├── PasswordService.java
│   └── RefreshTokenService.java
├── entity/           # Database entities
│   ├── OtpVerification.java
│   ├── EmailVerificationToken.java
│   ├── PasswordResetToken.java
│   └── RefreshToken.java
├── repository/       # Database access
│   ├── OtpVerificationRepository.java
│   ├── EmailVerificationTokenRepository.java
│   ├── PasswordResetTokenRepository.java
│   └── RefreshTokenRepository.java
└── dto/             # Data Transfer Objects
    ├── LoginRequest.java
    ├── RegisterRequest.java
    ├── ForgotPasswordRequest.java
    ├── ResetPasswordRequest.java
    ├── ChangePasswordRequest.java
    ├── ResendVerificationRequest.java
    ├── RefreshTokenRequest.java
    └── AuthResponse.java
```

---

## 🔐 1. Authentication Flow

### **A. USER REGISTRATION FLOW**

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "nic": "12345-6789",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "requestedRole": "DRIVER"
}
```

**Role-Specific Fields:**
- **DRIVER:**
  - `licenseNumber`: String
  - `licenseExpiryDate`: Date
  - `certifications`: String (comma-separated)
  - `experienceYears`: Integer

- **SYSTEM_USER/APPROVER:**
  - `employeeId`: String
  - `department`: String
  - `officeLocation`: String
  - `designation`: String
  - `approvalLevel`: String (for APPROVER role)

**Validation Rules:**
- ✅ Email format validation (RFC 5322)
- ✅ Password complexity: 8+ chars, uppercase, lowercase, number, special char
- ✅ Passwords must match
- ✅ Email must be unique
- ✅ Phone format validation
- ✅ NIC format validation
- ✅ Role-specific field validation

**Process:**
1. Validate request data
2. Check if email already exists
3. Hash password with BCrypt
4. Create User entity with status: `EMAIL_UNVERIFIED`
5. Generate `EmailVerificationToken` (24-hour expiry)
6. **Send email verification link** (async)
7. Return success message

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": null
}
```

---

### **B. EMAIL VERIFICATION FLOW**

**Endpoint:** `POST /api/auth/verify-email`

**Request:**
```
Query: ?token=JWT_TOKEN
```

**Process:**
1. Validate email verification token
2. Check token expiration (24 hours)
3. Update user status: `EMAIL_UNVERIFIED` → `PENDING_APPROVAL`
4. Delete used verification token
5. **Send approval notification email** to admin

**Response:**
```json
{
  "success": true,
  "message": "Email verified. Account pending approval.",
  "data": null
}
```

**User Status After:** `PENDING_APPROVAL`

---

### **C. OTP-BASED EMAIL VERIFICATION (Alternative)**

**Step 1: Send OTP**

**Endpoint:** `POST /api/auth/send-otp`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Process:**
1. Generate 6-digit OTP
2. Set expiry: 2 minutes from now
3. Store in `OtpVerification` table
4. **Send OTP email** (async)
5. Return success

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": null
}
```

---

**Step 2: Verify OTP**

**Endpoint:** `POST /api/auth/verify-otp`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Validation:**
- ✅ OTP exists and not expired
- ✅ OTP not already verified
- ✅ Max 3 failed attempts per OTP

**Process:**
1. Validate OTP
2. Mark as verified
3. Delete OTP after verification
4. Return verification response

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "verified": true,
    "message": "Your email is verified"
  }
}
```

---

### **D. USER LOGIN FLOW**

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation:**
- ✅ Email exists
- ✅ Password matches (BCrypt verification)
- ✅ Account is APPROVED status
- ✅ Account is not deactivated

**Process:**
1. Find user by email
2. Verify password against hash
3. Check user status (must be APPROVED)
4. Generate JWT token (15-minute expiry)
5. Generate Refresh token (7-day expiry)
6. Return tokens and user info

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "550e8400-e29b-41d4-a716...",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "DRIVER",
    "status": "APPROVED"
  }
}
```

**JWT Token Contains:**
- `sub`: email (username)
- `iat`: issued at
- `exp`: expiration (15 min)

---

## 🔑 2. Password Management

### **A. FORGOT PASSWORD FLOW**

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Important Security:**
- ✅ Same response for existing and non-existing emails (prevents enumeration)
- ✅ Only sends reset email to APPROVED accounts
- ✅ Token expires in 1 hour

**Process:**
1. Find user by email
2. Generate UUID-based reset token
3. Create `PasswordResetToken` (1-hour expiry)
4. **Send reset email with token link** (async)
5. Return generic success message

**Response:**
```json
{
  "success": true,
  "message": "If account exists, password reset link has been sent",
  "data": null
}
```

**Email Contains:**
- Reset link: `https://yourapp.com/auth/reset-password?token=UUID`

---

### **B. RESET PASSWORD FLOW**

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Validation:**
- ✅ Token exists and not expired (1 hour)
- ✅ Passwords match
- ✅ Password meets complexity requirements
- ✅ New password differs from current password

**Process:**
1. Find user by reset token
2. Validate token expiration
3. Validate password complexity
4. Hash new password with BCrypt
5. Update user password
6. Delete used reset token
7. Delete all refresh tokens (force re-login on all devices)

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful. Please login.",
  "data": null
}
```

---

### **C. CHANGE PASSWORD FLOW** (Authenticated)

**Endpoint:** `POST /api/user/change-password`

**Authentication:** Required (JWT token)

**Request:**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Validation:**
- ✅ Current password is correct
- ✅ New password != current password
- ✅ New passwords match
- ✅ Password meets complexity

**Process:**
1. Get current user from JWT
2. Verify current password
3. Validate new password complexity
4. Hash and update password
5. Delete all refresh tokens (re-login required on all devices)

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

## 📧 3. Email Service

### **Email Types Sent:**

**1. Verification Email**
- **Trigger:** User registration
- **Content:** Email verification link with 24-hour validity
- **Method:** `sendVerificationEmail(email, fullName, token)`

**2. OTP Email**
- **Trigger:** OTP request
- **Content:** 6-digit OTP code valid for 2 minutes
- **Method:** `sendOtpEmail(email, otp)`

**3. Approval Email**
- **Trigger:** Admin approves registration
- **Content:** Account approved notification + login URL
- **Method:** `sendApprovalEmail(email, fullName, roleName)`

**4. Rejection Email**
- **Trigger:** Admin rejects registration
- **Content:** Rejection reason + can re-apply message
- **Method:** `sendRejectionEmail(email, fullName, reason)`

**5. Password Reset Email**
- **Trigger:** Forgot password request
- **Content:** Password reset link with 1-hour validity
- **Method:** `sendPasswordResetEmail(email, fullName, token)`

**Implementation:**
- All emails sent **asynchronously** using `@Async` annotation
- HTML email templates with branded styling
- Proper exception handling and logging

---

## 🔄 4. Refresh Token Flow

**Purpose:** Extend user session without requiring password re-entry

**Endpoint:** Not currently exposed (internal use)

**Process:**
1. Access token expires (15 minutes)
2. Client stores refresh token
3. Use refresh token to request new access token
4. Generate new access token (15 min)
5. Return new access token

**Token Validity:**
- Access Token: 15 minutes
- Refresh Token: 7 days
- When change password is done → All refresh tokens deleted (force re-login)

---

## 🔐 5. Data Entities

### **OtpVerification Entity**
```java
@Entity
@Table(name = "otp_verifications")
public class OtpVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String otp;              // 6-digit code
    
    @Column(nullable = false)
    private Instant expiryTime;      // 2 minutes from creation
    
    private boolean verified;         // false initially
    
    @CreationTimestamp
    private Instant createdAt;
    
    // Methods
    public boolean isExpired() { /* ... */ }
}
```

---

### **EmailVerificationToken Entity**
```java
@Entity
@Table(name = "email_verification_tokens")
public class EmailVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String token;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(nullable = false)
    private Instant expiryDate;      // 24 hours from creation
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Methods
    public boolean isExpired() { /* ... */ }
}
```

---

### **PasswordResetToken Entity**
```java
@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String token;
    
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;
    
    @Column(nullable = false)
    private Instant expiryDate;      // 1 hour from creation
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    // Methods
    public boolean isExpired() { /* ... */ }
}
```

---

### **RefreshToken Entity**
```java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(unique = true, nullable = false)
    private String token;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private Instant expiryDate;      // 7 days from creation
    
    // Methods
    public boolean isExpired() { /* ... */ }
}
```

---

## 📊 6. Service Layer Details

### **AuthService**
```
Method: login(LoginRequest)
├─ Find user by email
├─ Verify BCrypt password
├─ Check status == APPROVED
├─ Generate JWT token
├─ Create refresh token
└─ Return AuthResponse

Method: register(RegisterRequest)
├─ Validate all fields
├─ Check email uniqueness
├─ Hash password (BCrypt)
├─ Create User entity
├─ Generate EmailVerificationToken
└─ Send verification email (async)

Method: verifyEmail(String token)
├─ Find token entity
├─ Check expiration
├─ Update user status: EMAIL_UNVERIFIED → PENDING_APPROVAL
└─ Delete token

Method: resendVerification(ResendVerificationRequest)
├─ Find user by email
├─ Delete existing verification token
├─ Generate new token
└─ Send email (async)
```

---

### **OtpService**
```
Method: sendOtp(String email)
├─ Generate 6-digit OTP
├─ Set 2-minute expiry
├─ Create/Update OtpVerification entity
├─ Send email (async)
└─ Return success

Method: verifyOtp(String email, String otp)
├─ Find OTP by email
├─ Check expiration
├─ Check not already verified
├─ Check attempts < 3
├─ Mark as verified
├─ Delete OTP
└─ Return boolean
```

---

### **PasswordService**
```
Method: forgotPassword(ForgotPasswordRequest)
├─ Find user by email (no error if not found)
├─ If found AND status == APPROVED:
│  ├─ Generate UUID reset token
│  ├─ Create PasswordResetToken (1 hour)
│  └─ Send reset email (async)
└─ Return generic success

Method: resetPassword(ResetPasswordRequest)
├─ Find user by token
├─ Check token expiration
├─ Validate new password complexity
├─ Hash password (BCrypt)
├─ Update user password
├─ Delete reset token
├─ Delete all refresh tokens (force re-login)
└─ Return success

Method: changePassword(User, ChangePasswordRequest)
├─ Verify current password
├─ Validate new password != current
├─ Validate complexity
├─ Hash new password
├─ Update password
├─ Delete all refresh tokens
└─ Return success
```

---

### **EmailService**
```
Method: sendVerificationEmail(email, fullName, token)
├─ Build verification URL
├─ Create HTML email from template
└─ Send email (async) with Exception logging

Method: sendApprovalEmail(email, fullName, roleName)
├─ Create HTML email from template
└─ Send email (async)

Method: sendRejectionEmail(email, fullName, reason)
├─ Create HTML email from template
└─ Send email (async)

Method: sendPasswordResetEmail(email, fullName, token)
├─ Build reset URL
├─ Create HTML email from template
└─ Send email (async)

Method: sendOtpEmail(email, otp)
├─ Create HTML email from template
└─ Send email (async)
```

---

### **RefreshTokenService**
```
Method: createRefreshToken(User)
├─ Generate UUID token
├─ Set 7-day expiry
├─ Save to database
└─ Return RefreshToken

Method: findByToken(String)
└─ Return Optional<RefreshToken>

Method: deleteByUser(User)
└─ Delete all refresh tokens for user
```

---

## 🛡️ 7. Security Features

### **Password Security:**
- ✅ BCrypt hashing (strength: 10)
- ✅ Complexity validation: 8+ chars, uppercase, lowercase, number, special char
- ✅ Cannot reuse current password
- ✅ Password hash never returned to client

### **Token Security:**
- ✅ JWT tokens signed with secret key
- ✅ Token expiration (short-lived: 15 min)
- ✅ Refresh token separate (7 days)
- ✅ Token invalidation on password change
- ✅ Token invalidation on logout

### **Email Security:**
- ✅ Email enumeration prevention (generic messages)
- ✅ Token-based email verification (non-guessable UUIDs)
- ✅ Token expiration (24 hours for email, 1 hour for password)
- ✅ One-time use tokens (deleted after use)

### **API Security:**
- ✅ HTTPS required (configured in production)
- ✅ CORS configured (controlled origins)
- ✅ CSRF disabled (stateless API)
- ✅ Rate limiting: Not implemented (TODO)
- ✅ Input validation: All DTOs validated

---

## ⚠️ 8. Error Handling

**Common Error Responses:**

```json
// Invalid credentials
{
  "success": false,
  "message": "Invalid email or password",
  "data": null
}

// Email already exists
{
  "success": false,
  "message": "Email already registered",
  "data": null
}

// Token expired
{
  "success": false,
  "message": "Token has expired. Please request a new one.",
  "data": null
}

// Invalid OTP
{
  "success": false,
  "message": "Invalid or expired OTP",
  "data": null
}

// Password complexity
{
  "success": false,
  "message": "Password must contain uppercase, lowercase, number, and special character",
  "data": null
}
```

**HTTP Status Codes:**
- `200 OK` - Successful request
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Authentication failed
- `409 Conflict` - Duplicate email
- `500 Internal Server Error` - Server error

---

## 📋 9. Sequence Diagram: Complete Flow

```
USER REGISTRATION → EMAIL VERIFICATION → ADMIN APPROVAL → LOGIN → PROTECTED ENDPOINTS
    ↓                      ↓                    ↓              ↓           ↓
1. Register          2. Verify email      3. Approve     4. JWT Token  5. Access
2. Email sent        3. Pending approval  4. APPROVED    5. Refresh    6. Refresh
3. EMAIL_UNVERIFIED  4. User notified     5. Email sent  6. Session    7. Valid

PASSWORD RESET FLOW:
Forgot → Email Sent → Click Link → Reset Page → New Password → Login
  ↓          ↓             ↓            ↓            ↓          ↓
Generate  1-hour      Validate    Form         Hash        Force
Token     token       token       validation   update      re-login
```

---

## 🔗 10. Integration Points

**With User Module:**
- Create User entity during registration
- Load User for authentication
- Update user status after email verification
- Check user status during login

**With Security Config:**
- JWT validation on every request
- CORS configuration
- Public vs protected endpoints

**With Email Service:**
- Async email sending
- HTML templates
- Exception handling

**With Admin Module (Future):**
- User approval/rejection endpoints
- User status updates

---

## 🚀 11. API Endpoints Summary

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|---------------|---------|
| POST | `/api/auth/send-otp` | ❌ | Send OTP to email |
| POST | `/api/auth/verify-otp` | ❌ | Verify OTP code |
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/verify-email` | ❌ | Verify email with token |
| POST | `/api/auth/login` | ❌ | Login and get tokens |
| POST | `/api/auth/resend-verification` | ❌ | Resend verification email |
| POST | `/api/auth/forgot-password` | ❌ | Request password reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password with token |
| POST | `/api/user/change-password` | ✅ | Change password (authenticated) |

---

## 💾 Database Tables

```sql
-- User accounts
users

-- Token management
email_verification_tokens
password_reset_tokens
refresh_tokens
otp_verifications
```

---

## 📌 Key Takeaways

1. **Registration is multi-step:** Register → Verify Email → Admin Approval → Login
2. **OTP optional:** Can use OTP instead of email token for verification
3. **Passwords are never returned:** Only tokens are returned
4. **Tokens are short-lived:** Access token 15 min, Refresh token 7 days
5. **Password changes invalidate all sessions:** User must re-login everywhere
6. **Email enumeration prevented:** Same response for existing/non-existing emails in forgot password
7. **Email verification required:** User cannot login without email verification and admin approval
8. **BCrypt hashing:** Password strength is cryptographically secure

---

*Last Updated: April 2026*
*Version: 1.0*
