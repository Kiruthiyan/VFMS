# 🔐 User Authentication Module - Professional Documentation

**Version:** 1.0.0  
**Last Updated:** April 2026  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Module Structure](#module-structure)
5. [API Endpoints](#api-endpoints)
6. [Security Implementation](#security-implementation)
7. [Setup & Installation](#setup--installation)
8. [Usage Examples](#usage-examples)
9. [Testing](#testing)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)

---

## Overview

The **User Authentication Module** is a comprehensive, enterprise-grade authentication system built with Spring Boot 3.3.4 and JWT tokens. It provides secure user registration, login, email verification, password management, and role-based access control (RBAC).

### Core Responsibilities

- 🔒 User registration and validation
- 🔑 JWT-based stateless authentication
- 📧 Email verification with OTP
- 🔄 Password reset and change workflows
- 🎯 Role-based access control
- 🛡️ Security configuration and CORS handling
- ⚙️ Async email notifications

---

## Key Features

### ✅ Authentication & Authorization

| Feature | Details |
|---------|---------|
| **Registration** | Self-service signup with comprehensive validation |
| **Login** | Email/password authentication with JWT tokens |
| **Email Verification** | OTP-based email confirmation (5-minute expiry) |
| **JWT Tokens** | Access tokens + Refresh tokens for session management |
| **RBAC** | Role-based dashboards: Admin, Approver, Staff, Driver |
| **Password Security** | Enforced complexity (8+ chars, upper, lower, digit, special) |
| **Password Reset** | Secure 2-step flow: OTP verification → Password reset |

### 🔒 Security Features

- **Password Encoding:** BCrypt with 10 salt rounds
- **CORS Security:** Explicit header whitelisting (no wildcard with credentials)
- **JWT Validation:** Comprehensive logging without exposing sensitive data
- **Rate Limiting Ready:** Foundation for implementing request throttling
- **Exception Handling:** Centralized mapping to appropriate HTTP status codes
- **Input Validation:** DTO-level constraints with regex patterns

### 📧 Email Notifications

- Verification emails with time-limited tokens
- Password reset instructions
- Account status updates
- **Async Processing:** Configurable thread pool (5 core, 10 max threads)

---

## Architecture

### Technology Stack

```
Frontend (Next.js 14 + TypeScript)
        ↓
    Axios Interceptors
    (Auto-inject JWT)
        ↓
REST API (Spring Boot 3.3.4)
        ↓
    Security Filter
    (JWT Validation)
        ↓
    Business Logic
    (Services)
        ↓
Database (H2/PostgreSQL)
```

### Key Components

1. **Controllers** - REST API endpoints
2. **Services** - Business logic and orchestration
3. **Repositories** - Data access layer
4. **DTOs** - Request/response validation
5. **Entities** - Database models
6. **Filters** - Request interceptors
7. **Utilities** - Helper functions

---

## Module Structure

```
backend/src/main/java/com/vfms/
├── auth/
│   ├── controller/
│   │   ├── AuthController.java          # /api/auth/* endpoints
│   │   └── PasswordController.java      # /api/password/* endpoints
│   ├── service/
│   │   ├── AuthService.java             # Login, registration logic
│   │   ├── EmailService.java            # Email notifications
│   │   ├── PasswordService.java         # Password validation & reset
│   │   ├── OtpService.java              # OTP generation & validation
│   │   └── RefreshTokenService.java     # Token refresh logic
│   ├── entity/
│   │   ├── EmailVerificationToken.java  # Email verification records
│   │   ├── PasswordResetToken.java      # Reset token tracking
│   │   └── RefreshToken.java            # Token management
│   ├── repository/
│   │   ├── EmailVerificationTokenRepository.java
│   │   ├── PasswordResetTokenRepository.java
│   │   └── RefreshTokenRepository.java
│   └── dto/
│       ├── LoginRequest.java
│       ├── RegisterRequest.java
│       ├── ForgotPasswordRequest.java
│       ├── ResetPasswordRequest.java
│       ├── ChangePasswordRequest.java
│       └── AuthResponse.java
├── config/
│   ├── AsyncConfig.java                 # Thread pool for async tasks
│   └── SecurityConfig.java              # Spring Security setup
├── security/
│   ├── JwtAuthenticationFilter.java      # JWT validation filter
│   ├── JwtService.java                  # Token generation/validation
│   └── SecurityContextProvider.java     # Security utilities
└── common/exception/
    ├── GlobalExceptionHandler.java      # Centralized error handling
    ├── AuthenticationException.java
    ├── ValidationException.java
    └── ResourceNotFoundException.java

frontend/src/
├── lib/
│   ├── api.ts                           # Axios instance with interceptors
│   ├── auth.ts                          # Frontend auth utilities
│   ├── constants/
│   │   ├── error-messages.ts            # User-facing error messages
│   │   ├── email-config.ts              # Email URLs & config
│   │   └── signup-config.ts             # Registration flow config
│   └── validators/auth/
│       ├── login-schema.ts              # Login validation rules
│       ├── signup-schema.ts             # Registration validation rules
│       └── password-schema.ts           # Password validation rules
├── components/auth/
│   ├── login-form.tsx                   # Login UI component
│   ├── signup-form.tsx                  # Registration UI component
│   ├── role-guard.tsx                   # Protected route wrapper
│   └── verify-email-card.tsx            # Email verification UI
├── store/
│   └── auth-store.ts                    # Zustand auth state management
└── app/auth/
    ├── login/page.tsx
    ├── signup/page.tsx
    ├── verify-email/page.tsx
    ├── forgot-password/page.tsx
    └── reset-password/page.tsx
```

---

## API Endpoints

### Authentication Endpoints

#### 1. **Register New User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "STAFF",
  "department": "Operations",
  "mobileNumber": "+923001234567"
}

Response: 201 Created
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "uuid",
  "email": "user@example.com"
}
```

#### 2. **Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_string",
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "STAFF",
    "emailVerified": true
  }
}
```

#### 3. **Verify Email**
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{ "message": "Email verified successfully" }
```

#### 4. **Refresh Token**
```http
POST /api/auth/refresh-token
Content-Type: application/json
Authorization: Bearer <refreshToken>

Response: 200 OK
{
  "accessToken": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

#### 5. **Logout**
```http
POST /api/auth/logout
Authorization: Bearer <accessToken>

Response: 200 OK
{ "message": "Logged out successfully" }
```

### Password Management Endpoints

#### 6. **Forgot Password**
```http
POST /api/password/forgot
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{ "message": "Password reset instructions sent to email" }
```

#### 7. **Verify OTP for Password Reset**
```http
POST /api/password/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{ 
  "message": "OTP verified",
  "resetToken": "token_for_reset"
}
```

#### 8. **Reset Password**
```http
POST /api/password/reset
Content-Type: application/json

{
  "email": "user@example.com",
  "resetToken": "token_from_verify_otp",
  "newPassword": "NewPassword123!"
}

Response: 200 OK
{ "message": "Password reset successfully" }
```

#### 9. **Change Password (Authenticated)**
```http
POST /api/password/change
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}

Response: 200 OK
{ "message": "Password changed successfully" }
```

---

## Security Implementation

### 1. Password Complexity Validation

**Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one digit (0-9)
- At least one special character (@$!%*?&)

**Enforcement Points:**
- Backend: `PasswordService.isStrongPassword()`
- Frontend: `password-schema.ts` validation rules
- Database: `LoginRequest` and `RegisterRequest` DTOs

### 2. JWT Token Security

| Aspect | Implementation |
|--------|----------------|
| **Generation** | `JwtService.generateToken()` |
| **Validation** | `JwtAuthenticationFilter` |
| **Expiry** | Access: 15 mins, Refresh: 7 days |
| **Signing** | HS256 algorithm with secure key |
| **Claims** | User ID, Email, Role, Issue time |

### 3. CORS Configuration

```java
// Explicit header whitelisting (not wildcard)
corsConfiguration.setAllowedHeaders(Arrays.asList(
  "Authorization", "Content-Type", "Accept", "X-Requested-With"
));
corsConfiguration.setExposedHeaders(Arrays.asList("Authorization"));
corsConfiguration.setAllowCredentials(true);
```

### 4. Exception Handling

All exceptions map to proper HTTP status codes:

| Exception | HTTP Status | Message |
|-----------|-------------|---------|
| `AuthenticationException` | 401 Unauthorized | Invalid credentials |
| `ValidationException` | 400 Bad Request | Input validation failed |
| `ResourceNotFoundException` | 404 Not Found | User not found |
| Generic Exception | 500 Internal Server Error | Server error |

### 5. Logging & Monitoring

- **JWT Validation:** Debug logs for successful auth, warning logs for failures
- **Never Exposed:** Actual JWT tokens are never logged
- **Audit Trail:** Email verification, password resets tracked

---

## Setup & Installation

### Prerequisites

- Java 21+
- Spring Boot 3.3.4
- Maven 3.8+
- Node.js 18+ (for frontend)
- H2 or PostgreSQL database

### Backend Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Configure Environment**
   ```bash
   # application.properties
   spring.datasource.url=jdbc:h2:mem:vfmsdb
   spring.jpa.hibernate.ddl-auto=create-drop
   spring.mail.host=smtp.gmail.com
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-app-password
   ```

3. **Build & Run**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

Server runs on: `http://localhost:8080`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   ```typescript
   // lib/api.ts
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

Frontend runs on: `http://localhost:3000`

---

## Usage Examples

### Example 1: Complete Registration & Login Flow

```typescript
// Frontend: signup-form.tsx
const handleSignup = async (formData) => {
  try {
    // Step 1: Register
    const response = await api.post('/auth/register', {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: 'STAFF',
      department: formData.department
    });
    
    // Step 2: Wait for verification email
    // User receives OTP
    
    // Step 3: Verify email
    await api.post('/auth/verify-email', {
      email: formData.email,
      otp: verificationCode
    });
    
    // Step 4: Redirect to login
    router.push('/auth/login');
  } catch (error) {
    setError(ERROR_MESSAGES.VALIDATION_ERROR);
  }
};
```

### Example 2: Protected API Call with JWT

```typescript
// Frontend: Automatic JWT injection via interceptor
const fetchUserData = async () => {
  // JWT automatically added to Authorization header
  const response = await api.get('/user/profile');
  return response.data;
};

// Backend: Protected endpoint
@GetMapping("/profile")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DRIVER', 'APPROVER')")
public ResponseEntity<?> getUserProfile() {
  String userId = SecurityContextProvider.getCurrentUserId();
  User user = userService.getUserById(userId);
  return ResponseEntity.ok(user);
}
```

### Example 3: Password Reset Flow

```typescript
// Frontend: forgot-password-form.tsx
const handlePasswordReset = async (email) => {
  try {
    // Step 1: Request password reset
    await api.post('/password/forgot', { email });
    
    // Step 2: User receives OTP
    
    // Step 3: Verify OTP
    const response = await api.post('/password/verify-otp', {
      email,
      otp: userOtp
    });
    
    // Step 4: Reset password
    await api.post('/password/reset', {
      email,
      resetToken: response.data.resetToken,
      newPassword: newPassword
    });
    
    router.push('/auth/login');
  } catch (error) {
    handleError(error);
  }
};
```

---

## Testing

### Backend Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=AuthServiceTest

# Run with coverage
mvn jacoco:report
```

**Test Coverage:**
- ✅ `AuthServiceTest` - Login, registration, credentials validation
- ✅ `PasswordServiceTest` - Password complexity, reset flows
- ✅ `ExceptionHandlerTest` - HTTP status mappings

### Frontend Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test auth-store.test.ts

# Coverage report
npm run test -- --coverage
```

**Test Coverage:**
- ✅ `auth-store.test.ts` - State management, persistence
- ✅ `api.test.ts` - JWT injection, interceptor configuration

### Example Test

```java
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {
  
  @Mock
  private UserRepository userRepository;
  
  @Mock
  private PasswordEncoder passwordEncoder;
  
  @InjectMocks
  private AuthService authService;
  
  @Test
  public void testLoginSuccess() {
    // Given
    LoginRequest request = new LoginRequest("user@test.com", "Password123!");
    User user = new User(...);
    
    when(userRepository.findByEmail("user@test.com"))
      .thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Password123!", user.getPassword()))
      .thenReturn(true);
    
    // When
    AuthResponse response = authService.login(request);
    
    // Then
    assertNotNull(response.getAccessToken());
    assertEquals("user@test.com", response.getUser().getEmail());
  }
}
```

---

## Error Handling

### Common Error Responses

```json
// 401 Unauthorized
{
  "status": 401,
  "message": "Invalid email or password",
  "timestamp": "2026-04-26T10:30:00Z",
  "path": "/api/auth/login"
}

// 400 Bad Request
{
  "status": 400,
  "message": "Password must contain uppercase, lowercase, digit, and special character",
  "timestamp": "2026-04-26T10:30:00Z",
  "path": "/api/auth/register"
}

// 404 Not Found
{
  "status": 404,
  "message": "User not found",
  "timestamp": "2026-04-26T10:30:00Z",
  "path": "/api/user/12345"
}
```

### Frontend Error Messages

All errors are mapped via `error-messages.ts`:

```typescript
export const ERROR_MESSAGES = {
  AUTHENTICATION_ERROR: 'Invalid email or password',
  VALIDATION_ERROR: 'Please check your input and try again',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_OTP: 'Invalid or expired OTP',
  PASSWORD_WEAK: 'Password does not meet complexity requirements',
  // ... 20+ more messages
};
```

---

## Best Practices

### ✅ For Developers

1. **Always validate at API boundary** - Use DTOs with validation annotations
2. **Never hardcode secrets** - Use environment variables
3. **Log without exposing sensitive data** - Filter passwords, tokens
4. **Test critical paths** - Authentication, password reset, authorization
5. **Use constants for strings** - Maintain single source of truth
6. **Document APIs** - Include examples in comments

### ✅ For DevOps

1. **Secure JWT Key** - Use strong, random secret (32+ chars)
2. **HTTPS Only** - Never transmit tokens over HTTP
3. **Set Token Expiry** - Balance security vs. UX
4. **Monitor Auth Failures** - Set up alerts for suspicious activity
5. **Rotate Credentials** - Regular password and token rotation
6. **Rate Limiting** - Implement on login/password endpoints

### ✅ For Security

1. **Never store plain passwords** - BCrypt hashing enforced
2. **Validate all inputs** - Both frontend and backend
3. **CORS carefully** - No wildcard with credentials
4. **Audit logging** - Track all auth events
5. **Email verification** - Prevent fake account registration

---

## Support & Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| "JWT signature invalid" | Check JWT_SECRET matches frontend |
| "CORS error on login" | Verify SecurityConfig CORS settings |
| "OTP not received" | Check email service configuration |
| "Token expired" | Use refresh token endpoint |

### Resources

- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [Spring Security Documentation](https://spring.io/projects/spring-security)
- [OWASP Authentication Guide](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Last Updated:** April 26, 2026  
**Maintained By:** Development Team  
**License:** Apache 2.0
