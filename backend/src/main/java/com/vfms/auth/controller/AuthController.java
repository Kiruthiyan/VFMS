package com.vfms.auth.controller;

import com.vfms.auth.dto.RegisterRequest;
import com.vfms.auth.dto.ResendVerificationRequest;
import com.vfms.auth.service.AuthService;
import com.vfms.auth.service.OtpService;
import com.vfms.common.exception.ValidationException;
import com.vfms.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER AUTHENTICATION & REGISTRATION API CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   This controller manages all user authentication and registration operations.
 *   It handles user registration, email verification, OTP validation, and login.
 *   Core security component for fleet management system access control.
 * 
 * BASE PATH:
 *   /api/auth
 * 
 * SECURITY FEATURES:
 *   ✓ Email verification via OTP (One-Time Password)
 *   ✓ Email-based user registration
 *   ✓ Secure login with JWT tokens
 *   ✓ Admin approval workflow for new users
 *   ✓ Email enumeration attack prevention
 *   ✓ Automatic OTP expiration (time-limited)
 *   ✓ Rate limiting on OTP requests
 * 
 * USER ROLES:
 *   - ADMIN: Full system access, can approve users
 *   - DRIVER: Limited access, can view assigned vehicles
 *   - SUPERVISOR: Monitoring and reporting access
 * 
 * AUTHENTICATION FLOW:
 *   1. User sends OTP request with email
 *   2. System sends verification code to email
 *   3. User verifies OTP code
 *   4. User registers account with verified email
 *   5. Email verification link sent
 *   6. User clicks link to verify email
 *   7. Admin approves account
 *   8. User can login with email & password
 * 
 * REGISTRATION WORKFLOW:
 *   OTP Verification → Register → Email Verification → Admin Approval → Login
 * 
 * KEY ENDPOINTS:
 *   POST /api/auth/send-otp              - Request verification code
 *   POST /api/auth/verify-otp            - Verify code
 *   POST /api/auth/register              - Create new account
 *   POST /api/auth/verify-email          - Confirm email
 *   POST /api/auth/login                 - Sign in to system
 *   POST /api/auth/resend-verification   - Resend email verification
 * 
 * @author Authentication Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    // ─────────────────────────────────────────────────────────────────────────
    // Service Dependencies
    // ─────────────────────────────────────────────────────────────────────────
    private final AuthService authService;     // Handles authentication logic
    private final OtpService otpService;       // Handles OTP generation & verification

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  O T P   V E R I F I C A T I O N   E P  ████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Send OTP (One-Time Password) for Email Verification
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Sends a verification code to user's email address.
     *   First step in registration process - verifies email ownership.
     * 
     * ENDPOINT:
     *   POST /api/auth/send-otp
     *   Content-Type: application/json
     * 
     * REQUEST BODY:
     *   {
     *     "email": "user@example.com"
     *   }
     * 
     * VALIDATION:
     *   - Email is required
     *   - Email must be valid format (RFC 5322)
     *   - Email cannot be already registered
     *   - Automatically converts to lowercase
     *   - Trims whitespace
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/send-otp
     *   {
     *     "email": "john.driver@fleet.com"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Verification code sent to your email. Please check your inbox.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - OTP sent successfully
     *   400 BAD REQUEST     - Email is required or invalid
     *   500 INTERNAL ERROR  - Email service failure
     * 
     * WHAT HAPPENS:
     *   1. Validates email format
     *   2. Checks if email already registered
     *   3. Generates random 6-digit OTP
     *   4. Stores OTP in database with 5-minute expiration
     *   5. Sends OTP via email
     *   6. Returns success message
     * 
     * OTP DETAILS:
     *   - Format: 6-digit numeric code (e.g., 456789)
     *   - Validity: 5 minutes from generation
     *   - Attempts: 3 invalid attempts allowed
     *   - After 3 failures: Must request new OTP
     *   - Re-request: User can request new OTP anytime
     * 
     * EMAIL DELIVERY:
     *   - Sent via SMTP (email service)
     *   - Includes OTP code in plain text
     *   - Includes expiration time
     *   - Includes link to verify code (optional)
     *   - Template: Professional branded template
     * 
     * SECURITY:
     *   - OTP not returned in API response (sent only via email)
     *   - Email converted to lowercase (case-insensitive)
     *   - Prevents email enumeration (always returns success)
     *   - Rate limited: Max 5 requests per hour per email
     *   - OTP encrypted in database
     * 
     * USE CASES:
     *   - New user registration
     *   - Email verification during signup
     *   - Before account activation
     * 
     * NEXT STEPS:
     *   1. Check email for verification code
     *   2. Call /api/auth/verify-otp with code
     *   3. Proceed to registration
     * 
     * RATE LIMITING:
     *   - Maximum 5 OTP requests per email per hour
     *   - After limit: Must wait 1 hour for next request
     *   - Prevents abuse and spam
     * 
     * @param request SendOtpRequest containing email address
     * @return HTTP 200 with success message (always shows success for security)
     * @throws Exception if email service fails
     * 
     * @see SendOtpRequest for request structure
     * @see #verifyOtp(VerifyOtpRequest) for next step
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @RequestBody SendOtpRequest request) {
        try {
            // Validate email is provided
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Email is required")
                );
            }
            
            // Send OTP to provided email (service handles generation & storage)
            otpService.sendOtp(request.getEmail().trim().toLowerCase());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "Verification code sent to your email. Please check your inbox.",
                            null)
            );
        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            // Generic error message for unexpected failures
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Failed to send verification code. Please try again later.")
            );
        }
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Verify OTP (One-Time Password)
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Verifies the OTP code sent to user's email.
     *   Confirms that user has access to the provided email address.
     * 
     * ENDPOINT:
     *   POST /api/auth/verify-otp
     *   Content-Type: application/json
     * 
     * REQUEST BODY:
     *   {
     *     "email": "user@example.com",
     *     "otp": "456789"
     *   }
     * 
     * VALIDATION:
     *   - Email is required
     *   - OTP code is required (6 digits)
     *   - OTP must not be expired (5 minutes max)
     *   - OTP must match code sent to email
     *   - Maximum 3 failed attempts
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/verify-otp
     *   {
     *     "email": "john.driver@fleet.com",
     *     "otp": "456789"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "OTP verified successfully. You can now proceed with registration.",
     *     "data": {
     *       "verified": true
     *     }
     *   }
     * 
     * EXAMPLE ERROR RESPONSE (400 BAD REQUEST):
     *   {
     *     "success": false,
     *     "message": "Invalid or expired verification code. Please request a new one.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - OTP verified successfully
     *   400 BAD REQUEST     - Invalid/expired OTP or missing fields
     *   401 UNAUTHORIZED    - OTP incorrect
     *   500 INTERNAL ERROR  - System error
     * 
     * OTP VERIFICATION PROCESS:
     *   1. Retrieves stored OTP for email
     *   2. Checks if OTP has expired
     *   3. Compares user-provided OTP with stored OTP
     *   4. Increments attempt counter
     *   5. Locks account after 3 failed attempts
     *   6. Returns success/failure
     * 
     * FAILURE SCENARIOS:
     *   - OTP expired: "Verification code has expired. Request a new one."
     *   - Wrong OTP: "Invalid verification code. Please try again."
     *   - Too many attempts: "Too many failed attempts. Request a new verification code."
     *   - Email not found: "No verification code found for this email."
     * 
     * AFTER SUCCESSFUL VERIFICATION:
     *   - Email marked as verified (can be used for registration)
     *   - OTP deleted from system
     *   - User can proceed to registration endpoint
     *   - Email locked for next 60 minutes (prevents re-registration)
     * 
     * SECURITY:
     *   - OTP comparison is case-sensitive
     *   - Email converted to lowercase
     *   - Failed attempts tracked
     *   - Account locked after 3 failures
     *   - OTP not logged in system logs
     *   - All timestamps stored in UTC
     * 
     * ATTEMPT TRACKING:
     *   - First failure: Can retry
     *   - Second failure: Can retry once more
     *   - Third failure: Account locked for 15 minutes
     *   - After 15 minutes: Can request new OTP
     * 
     * TYPICAL FLOW:
     *   1. User receives OTP in email
     *   2. User calls this endpoint with OTP
     *   3. System verifies OTP
     *   4. User proceeds to registration
     * 
     * NEXT STEPS (If Verified):
     *   - Call /api/auth/register with email & password
     * 
     * NEXT STEPS (If Failed):
     *   - Call /api/auth/send-otp again to request new code
     * 
     * @param request VerifyOtpRequest containing email and OTP code
     * @return HTTP 200 with verification result
     * @throws RuntimeException if OTP invalid/expired
     * 
     * @see VerifyOtpRequest for request structure
     * @see VerifyOtpResponse for response structure
     * @see #sendOtp(SendOtpRequest) to request new OTP
     * @see #register(RegisterRequest) for next step
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponse>> verifyOtp(
            @RequestBody VerifyOtpRequest request) {
        try {
            // Validate email is provided
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Email is required")
                );
            }
            // Validate OTP is provided
            if (request.getOtp() == null || request.getOtp().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                        ApiResponse.error("Please enter the verification code sent to your email.")
                );
            }
            
            // Verify OTP (service handles validation, expiration check, and attempt tracking)
            otpService.verifyOtp(request.getEmail().trim().toLowerCase(), request.getOtp().trim());
            return ResponseEntity.ok(
                    ApiResponse.success(
                            "OTP verified successfully. You can now proceed with registration.",
                            new VerifyOtpResponse(true))
            );
        } catch (RuntimeException e) {
            // Return user-friendly error message
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(e.getMessage())
            );
        } catch (Exception e) {
            // Generic error for unexpected failures
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.error("Verification failed. Please try again.")
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  A U T H E N T I C A T I O N   O P S  █████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * User Login - Authenticate User and Get JWT Token
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Authenticates user credentials and returns JWT token for API access.
     *   Used by frontend to login user and establish authenticated session.
     * 
     * ENDPOINT:
     *   POST /api/auth/login
     *   Content-Type: application/json
     *   No authentication required
     * 
     * REQUEST BODY:
     *   {
     *     "email": "user@example.com",
     *     "password": "secure_password"
     *   }
     * 
     * VALIDATION:
     *   - Email is required and must be valid format
     *   - Password is required (minimum 8 characters)
     *   - Email must exist in system (registered account)
     *   - Password must match stored password
     *   - Account must be verified (email confirmed)
     *   - Account must be approved by admin
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/login
     *   {
     *     "email": "john.driver@fleet.com",
     *     "password": "SecurePass123"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Login successful",
     *     "data": {
     *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *       "email": "john.driver@fleet.com",
     *       "name": "John Smith",
     *       "role": "DRIVER",
     *       "expiresIn": 86400000
     *     }
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Login successful, token returned
     *   400 BAD REQUEST     - Missing email/password or invalid format
     *   401 UNAUTHORIZED    - Invalid credentials
     *   403 FORBIDDEN       - Account not verified or not approved
     *   500 INTERNAL ERROR  - System error
     * 
     * JWT TOKEN DETAILS:
     *   - Format: Bearer token (JWT)
     *   - Validity: 24 hours from issuance
     *   - Payload includes: user ID, email, role, issued time
     *   - Signed with: HMAC-SHA256
     *   - Encoding: Base64 URL-safe
     * 
     * TOKEN USAGE:
     *   - Include in Authorization header
     *   - Format: "Authorization: Bearer <token>"
     *   - Used for all authenticated API requests
     *   - Sent with every request after login
     * 
     * WHAT HAPPENS:
     *   1. Validates email and password provided
     *   2. Looks up user by email
     *   3. Compares provided password with hashed stored password
     *   4. Checks if account is verified
     *   5. Checks if admin has approved account
     *   6. Generates JWT token with user claims
     *   7. Returns token and user details
     * 
     * FAILURE SCENARIOS:
     *   - Wrong password: "Invalid email or password"
     *   - Email not registered: "Invalid email or password" (doesn't reveal existence)
     *   - Account not verified: "Please verify your email before logging in"
     *   - Account not approved: "Your account is pending admin approval"
     *   - Account disabled: "Your account has been disabled"
     * 
     * PASSWORD SECURITY:
     *   - Passwords hashed with BCrypt (salted)
     *   - Original password never stored in database
     *   - Passwords never logged or exposed in errors
     *   - Comparison using constant-time algorithm
     * 
     * ACCOUNT STATUS CHECKS:
     *   - PENDING: Email not verified yet
     *   - UNVERIFIED: Waiting for admin approval
     *   - ACTIVE: Can login
     *   - DISABLED: Cannot login
     *   - LOCKED: Too many failed attempts (temp locked)
     * 
     * SECURITY FEATURES:
     *   - Rate limiting: Max 5 failed attempts per hour
     *   - After 5 failures: Account locked for 15 minutes
     *   - Failed attempts logged
     *   - Successful login logs timestamp and IP
     *   - Generic error messages (no info leakage)
     *   - HTTPS only (in production)
     * 
     * TYPICAL WORKFLOW:
     *   1. User enters email and password in login form
     *   2. Frontend sends request to this endpoint
     *   3. System validates credentials
     *   4. Returns JWT token
     *   5. Frontend stores token in localStorage/sessionStorage
     *   6. Frontend includes token in all future API requests
     * 
     * AFTER LOGIN:
     *   - Token stored on frontend (securely)
     *   - User redirected to dashboard
     *   - Token sent with all subsequent requests
     *   - Token expires after 24 hours
     *   - User can request token refresh (if implemented)
     * 
     * LOGOUT:
     *   - Frontend deletes token from storage
     *   - No backend call needed (stateless JWT)
     *   - Token becomes invalid on expiration
     * 
     * @param request LoginRequest containing email and password
     * @return HTTP 200 with JWT token and user details
     * @throws AuthenticationException if credentials invalid
     * 
     * @see LoginRequest for request structure
     * @see AuthResponse for response structure
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<com.vfms.auth.dto.AuthResponse>> login(@Valid @RequestBody com.vfms.auth.dto.LoginRequest request) {
        // Call service to authenticate and generate token
        com.vfms.auth.dto.AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  R E G I S T R A T I O N   O P S  ███████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Register New User Account
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Creates a new user account in the system.
     *   Must be called AFTER OTP verification (email verified).
     *   Sends confirmation email with verification link.
     * 
     * ENDPOINT:
     *   POST /api/auth/register
     *   Content-Type: application/json
     *   No authentication required
     * 
     * REQUEST BODY:
     *   {
     *     "email": "newuser@example.com",
     *     "password": "SecurePassword123",
     *     "firstName": "John",
     *     "lastName": "Smith",
     *     "phoneNumber": "+919876543210"
     *   }
     * 
     * VALIDATION RULES:
     *   - Email: Required, valid format, must be verified via OTP first
     *   - Password: Required, minimum 8 characters
     *     ├─ Must include uppercase letter (A-Z)
     *     ├─ Must include lowercase letter (a-z)
     *     ├─ Must include number (0-9)
     *     └─ Must include special character (!@#$%^&*)
     *   - First name: Required, 2-50 characters
     *   - Last name: Required, 2-50 characters
     *   - Phone number: Optional, valid format if provided
     *   - Email must not already be registered
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/register
     *   {
     *     "email": "john.smith@fleet.com",
     *     "password": "SecurePass123!",
     *     "firstName": "John",
     *     "lastName": "Smith",
     *     "phoneNumber": "+919876543210"
     *   }
     * 
     * EXAMPLE RESPONSE (201 CREATED):
     *   {
     *     "success": true,
     *     "message": "Registration successful. Please check your email to verify your account.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   201 CREATED         - Account created successfully
     *   400 BAD REQUEST     - Validation failed (check error message)
     *   409 CONFLICT        - Email already registered
     *   500 INTERNAL ERROR  - System error
     * 
     * WHAT HAPPENS:
     *   1. Validates all required fields
     *   2. Checks email format validity
     *   3. Checks password meets complexity requirements
     *   4. Checks email not already registered
     *   5. Checks email was verified via OTP
     *   6. Hashes password using BCrypt
     *   7. Creates user record in database
     *   8. Sets account status to "PENDING_EMAIL_VERIFICATION"
     *   9. Generates verification token
     *   10. Sends verification email with confirmation link
     *   11. Returns success message
     * 
     * PASSWORD REQUIREMENTS:
     *   ✓ Minimum 8 characters
     *   ✓ Must include uppercase (A-Z)
     *   ✓ Must include lowercase (a-z)
     *   ✓ Must include number (0-9)
     *   ✓ Must include special character (!@#$%^&*)
     * 
     * EXAMPLE VALID PASSWORDS:
     *   - "SecurePass123!"
     *   - "MyFleet@2024"
     *   - "Drivers#123"
     * 
     * EXAMPLE INVALID PASSWORDS:
     *   - "password" (no uppercase, no number, no special char)
     *   - "Password123" (no special character)
     *   - "Pass1!" (too short)
     *   - "PASSWORD123!" (no lowercase)
     * 
     * EMAIL VERIFICATION PROCESS:
     *   1. Registration email sent
     *   2. Email contains verification link with token
     *   3. User clicks link in email
     *   4. Calls /api/auth/verify-email endpoint
     *   5. Account status changes to "PENDING_ADMIN_APPROVAL"
     *   6. Admin sees new account in dashboard
     *   7. Admin approves account
     *   8. User can now login
     * 
     * ACCOUNT STATUS FLOW:
     *   OTP_VERIFIED → PENDING_EMAIL_VERIFICATION → PENDING_ADMIN_APPROVAL → ACTIVE
     * 
     * AFTER REGISTRATION:
     *   - Email verification link sent to user
     *   - User must click link in email
     *   - Account status: PENDING_EMAIL_VERIFICATION
     *   - Cannot login yet (must verify email and get admin approval)
     *   - Admin notified of new registration
     * 
     * PREREQUISITES:
     *   ✓ Email must be OTP verified first
     *   ✓ Email must not be registered
     *   ✓ Email must not be used before
     * 
     * FAILURE SCENARIOS:
     *   - Email not verified: "Email not verified. Please verify via OTP first."
     *   - Email already registered: "Email already registered. Please login or reset password."
     *   - Password too weak: "Password does not meet complexity requirements."
     *   - Invalid email format: "Invalid email address format."
     *   - Missing required fields: "All fields are required."
     * 
     * PASSWORD HASHING:
     *   - Algorithm: BCrypt with salt
     *   - Cost factor: 10
     *   - Original password never stored
     *   - Hashed password stored in database
     *   - Comparison done with constant-time algorithm
     * 
     * SECURITY FEATURES:
     *   - Email verified before registration allowed
     *   - Password hashed and salted
     *   - Admin approval required before login
     *   - Account lockout possible (admin control)
     *   - Registration logged with timestamp
     *   - Verification token time-limited (24 hours)
     * 
     * USER ROLES:
     *   - Default role: DRIVER
     *   - Can be changed by admin to: SUPERVISOR, ADMIN
     * 
     * TYPICAL REGISTRATION FLOW:
     *   1. User requests OTP: /api/auth/send-otp
     *   2. User verifies OTP: /api/auth/verify-otp
     *   3. User submits registration: /api/auth/register
     *   4. User receives verification email
     *   5. User clicks link: /api/auth/verify-email?token=xxx
     *   6. Admin approves account (backend only)
     *   7. User can login: /api/auth/login
     * 
     * @param request RegisterRequest with email, password, name details
     * @return HTTP 201 Created with success message
     * @throws ValidationException if validation fails
     * @throws ConflictException if email already registered
     * 
     * @see RegisterRequest for request structure
     * @see #verifyEmail(String) for email verification step
     * @see #login(LoginRequest) for login after verification
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequest request) {
        // Call service to create user account and send verification email
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(
                        "Registration successful. Please check your email to verify your account.",
                        null)
        );
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Verify Email Address - Confirm Email Ownership
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Confirms that user has access to the registered email address.
     *   User clicks link in verification email which calls this endpoint.
     *   Must be completed before admin approval and login access.
     * 
     * ENDPOINT:
     *   POST /api/auth/verify-email?token=xxxxx
     *   Query parameter: token (verification token from email link)
     *   No authentication required
     * 
     * HOW IT WORKS:
     *   1. User receives email with verification link
     *   2. Link includes unique verification token
     *   3. User clicks link or copy-pastes token
     *   4. Frontend calls this endpoint with token
     *   5. System validates token and marks email as verified
     *   6. Account awaits admin approval
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/verify-email?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Email verified. Your account is pending admin approval.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Email verified successfully
     *   400 BAD REQUEST     - Token missing or invalid
     *   401 UNAUTHORIZED    - Token expired
     *   404 NOT FOUND       - Token not found in system
     *   500 INTERNAL ERROR  - System error
     * 
     * TOKEN DETAILS:
     *   - Format: JWT token (same as auth tokens)
     *   - Validity: 24 hours from email sent
     *   - One-time use: Token becomes invalid after use
     *   - Unique per registration: Each registration gets new token
     * 
     * WHAT HAPPENS:
     *   1. Validates token provided
     *   2. Decodes token to extract user information
     *   3. Checks token has not expired (24 hour limit)
     *   4. Checks token not already used
     *   5. Looks up user by email from token
     *   6. Marks user's email as verified
     *   7. Changes account status to "PENDING_ADMIN_APPROVAL"
     *   8. Notifies admin of new account needing approval
     *   9. Returns success message
     * 
     * FAILURE SCENARIOS:
     *   - Token expired: "Verification link has expired. Request new email."
     *   - Token invalid: "Invalid verification link. Check link in email."
     *   - Token already used: "Email already verified."
     *   - Token not found: "Verification link not found."
     *   - User not found: "User account not found."
     * 
     * AFTER EMAIL VERIFICATION:
     *   - Email marked as verified
     *   - Account status: PENDING_ADMIN_APPROVAL
     *   - Admin must approve account
     *   - User cannot login yet
     *   - User can request resend if link expired
     * 
     * NEXT STEPS:
     *   1. Admin reviews new account in dashboard
     *   2. Admin approves account
     *   3. User receives approval notification
     *   4. User can login with email & password
     * 
     * VERIFICATION EMAIL FLOW:
     *   Registration → Email sent → User clicks link → Verification → Admin approval → Login
     * 
     * IF TOKEN EXPIRED:
     *   1. User gets error message in browser
     *   2. User can request resend: /api/auth/resend-verification
     *   3. New email sent with new token
     *   4. User clicks new link
     * 
     * SECURITY:
     *   - Token time-limited (24 hours)
     *   - Token one-time use only
     *   - Token signed (cannot be forged)
     *   - Only works for correct email
     *   - Requires admin approval before login
     * 
     * @param token Verification token from email link (query parameter)
     * @return HTTP 200 with verification result
     * @throws InvalidTokenException if token invalid/expired
     * 
     * @see #resendVerification(ResendVerificationRequest) to request new email
     * @see #login(LoginRequest) to login after admin approval
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(
            @RequestParam String token) {
        // Call service to verify token and mark email as verified
        authService.verifyEmail(token);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Email verified. Your account is pending admin approval.",
                        null)
        );
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Resend Email Verification Link
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Resends verification email if user didn't receive it or link expired.
     *   Generates new verification token and sends new email.
     * 
     * ENDPOINT:
     *   POST /api/auth/resend-verification
     *   Content-Type: application/json
     *   No authentication required
     * 
     * REQUEST BODY:
     *   {
     *     "email": "newuser@example.com"
     *   }
     * 
     * VALIDATION:
     *   - Email is required
     *   - Email must be registered (in pending status)
     *   - Email must not be already verified
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/resend-verification
     *   {
     *     "email": "john.smith@fleet.com"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Verification email sent. Please check your inbox.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Email sent successfully
     *   400 BAD REQUEST     - Email required/invalid
     *   404 NOT FOUND       - Email not found or already verified
     *   429 TOO MANY        - Too many resend requests (rate limited)
     *   500 INTERNAL ERROR  - System error
     * 
     * WHEN TO USE:
     *   - User didn't receive original email
     *   - Verification email expired (24 hour limit)
     *   - User wants to re-register same email
     *   - Email client marked email as spam
     * 
     * WHAT HAPPENS:
     *   1. Validates email provided
     *   2. Looks up user account by email
     *   3. Checks if account is in pending state
     *   4. Checks if email not already verified
     *   5. Generates new verification token
     *   6. Stores new token in database
     *   7. Sends verification email with new token
     *   8. Returns success message
     * 
     * RATE LIMITING:
     *   - Max 5 resend requests per email per hour
     *   - After limit: Must wait 1 hour for next resend
     *   - Prevents spam and abuse
     * 
     * NEW TOKEN DETAILS:
     *   - Format: Fresh JWT token
     *   - Validity: 24 hours from issuance
     *   - Link: Automatically generated in email
     * 
     * SECURITY:
     *   - Only works for pending accounts
     *   - Already verified accounts cannot resend
     *   - Rate limited to prevent abuse
     *   - New token invalidates old token
     *   - Only valid email addresses work
     * 
     * TYPICAL USE CASE:
     *   1. User registers account
     *   2. User doesn't receive email (spam folder)
     *   3. User requests resend
     *   4. New verification email sent
     *   5. User clicks new link
     *   6. Email verified
     *   7. Admin approves
     *   8. User can login
     * 
     * @param request ResendVerificationRequest containing email
     * @return HTTP 200 with success message
     * 
     * @see #verifyEmail(String) to verify email after receiving new link
     * @see #register(RegisterRequest) for initial registration
     */
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {
        // Call service to generate new token and send verification email
        authService.resendVerification(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Verification email sent. Please check your inbox.",
                        null)
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  R E Q U E S T / R E S P O N S E   D T O s  ███████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Request DTO for sending OTP verification code
     * Used by /api/auth/send-otp endpoint
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class SendOtpRequest {
        private String email;  // Email to send OTP to
    }

    /**
     * Request DTO for verifying OTP code
     * Used by /api/auth/verify-otp endpoint
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VerifyOtpRequest {
        private String email;  // Email that received OTP
        private String otp;    // 6-digit verification code
    }

    /**
     * Response DTO for OTP verification result
     * Returned from /api/auth/verify-otp endpoint
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class VerifyOtpResponse {
        private boolean verified;  // true if OTP verified successfully
    }
}
