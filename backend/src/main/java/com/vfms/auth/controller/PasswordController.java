package com.vfms.auth.controller;

import com.vfms.auth.dto.ChangePasswordRequest;
import com.vfms.auth.dto.ForgotPasswordRequest;
import com.vfms.auth.dto.ResetPasswordRequest;
import com.vfms.auth.service.PasswordService;
import com.vfms.common.dto.ApiResponse;
import com.vfms.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PASSWORD MANAGEMENT API CONTROLLER
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 *   This controller manages all password-related operations in the VFMS system.
 *   It handles password resets, password changes, and account recovery.
 *   Critical component for user account security and access management.
 * 
 * ENDPOINTS:
 *   POST /api/auth/forgot-password      - Request password reset (anonymous)
 *   POST /api/auth/reset-password       - Reset password with token (anonymous)
 *   POST /api/user/change-password      - Change password (authenticated users)
 * 
 * SECURITY FEATURES:
 *   ✓ Secure token-based password reset
 *   ✓ Time-limited reset links (24 hours)
 *   ✓ One-time use tokens (cannot reuse)
 *   ✓ Email verification for reset requests
 *   ✓ Authenticated password changes
 *   ✓ Password complexity validation
 *   ✓ Email enumeration attack prevention
 *   ✓ Password history tracking (no reuse)
 *   ✓ BCrypt hashing with salt
 * 
 * SECURITY NOTES:
 *   - All password operations require email verification
 *   - Reset tokens sent via email only (never in API response)
 *   - Tokens time-limited to 24 hours
 *   - Tokens single-use (becomes invalid after use)
 *   - Generic error messages (no account enumeration)
 *   - All operations logged for audit trail
 * 
 * PASSWORD REQUIREMENTS:
 *   - Minimum 8 characters
 *   - Must include uppercase letter (A-Z)
 *   - Must include lowercase letter (a-z)
 *   - Must include number (0-9)
 *   - Must include special character (!@#$%^&*)
 *   - Cannot match previous 3 passwords
 * 
 * TYPICAL WORKFLOWS:
 *   
 *   Forgot Password Workflow:
 *   User forgot → Request reset → Email sent → Click link → Enter new password → Success
 *   
 *   Change Password Workflow (logged in):
 *   User logged in → Enter old password → Enter new password → Verify → Success
 * 
 * @author Password Management Team
 * @version 1.0
 */
@RestController
@RequiredArgsConstructor
public class PasswordController {

    // ─────────────────────────────────────────────────────────────────────────
    // Service Dependencies
    // ─────────────────────────────────────────────────────────────────────────
    private final PasswordService passwordService;  // Handles password operations

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  P U B L I C   E P   ( / a p i / a u t h )  █████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Request Password Reset - Send Reset Link to Email
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Initiates password reset process for users who forgot their password.
     *   Generates secure token and sends reset link via email.
     *   No authentication required (for account recovery).
     * 
     * ENDPOINT:
     *   POST /api/auth/forgot-password
     *   Content-Type: application/json
     *   No authentication required
     * 
     * REQUEST BODY:
     *   {
     *     "email": "user@example.com"
     *   }
     * 
     * VALIDATION:
     *   - Email is required
     *   - Email must be valid format
     *   - Email must be registered in system
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/forgot-password
     *   {
     *     "email": "john.driver@fleet.com"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK - Always):
     *   {
     *     "success": true,
     *     "message": "If an account with that email exists, a reset link has been sent.",
     *     "data": null
     *   }
     * 
     * IMPORTANT: Same response whether email exists or not
     *   - Prevents email enumeration attacks
     *   - Does not reveal if account exists
     *   - User cannot determine valid emails
     *   - Security best practice
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Always returns 200 (for security)
     *   400 BAD REQUEST     - Email required/invalid format only
     *   500 INTERNAL ERROR  - System error (rare)
     * 
     * WHAT HAPPENS:
     *   1. Validates email provided
     *   2. Looks up user by email (silent if not found)
     *   3. If account found:
     *      ├─ Generates unique reset token (JWT)
     *      ├─ Stores token in database
     *      ├─ Sends reset email with link
     *      └─ Sets token expiration (24 hours)
     *   4. If account not found: Silently does nothing
     *   5. Returns generic success message
     * 
     * RESET TOKEN DETAILS:
     *   - Format: JWT token (long random string)
     *   - Validity: 24 hours from generation
     *   - One-time use: Becomes invalid after use
     *   - Unique per request: New token per reset request
     *   - Not returned in API (sent only via email)
     * 
     * EMAIL CONTENTS:
     *   - Greeting with user name
     *   - Reset link with embedded token
     *   - Warning: Link expires in 24 hours
     *   - Note: If not requested, ignore email
     *   - Alternative: Contact support
     * 
     * RESET LINK FORMAT:
     *   https://app.com/reset-password?token=eyJhbGciOiJIUzI1NiIs...
     * 
     * SECURITY FEATURES:
     *   - Generic success message (no info leakage)
     *   - Token not exposed in API response
     *   - Token time-limited (24 hours)
     *   - Token single-use
     *   - Email verification required
     *   - HTTPS only (in production)
     *   - Rate limited: Max 5 requests per email per hour
     * 
     * RATE LIMITING:
     *   - Maximum 5 reset requests per email per hour
     *   - After limit: Must wait 1 hour
     *   - Prevents password reset abuse
     * 
     * EMAIL NOT RECEIVED?
     *   User should:
     *   1. Check spam/junk folder
     *   2. Request reset again (new link)
     *   3. Contact support if issue persists
     * 
     * TOKEN EXPIRATION:
     *   - Tokens valid for 24 hours only
     *   - After 24 hours: User must request new reset
     *   - User sees error: "Reset link has expired"
     *   - Solution: Request new reset link
     * 
     * MULTIPLE RESET REQUESTS:
     *   - User can request multiple times
     *   - Each request generates new token
     *   - Previous tokens become invalid
     *   - Only latest token works
     * 
     * TYPICAL WORKFLOW:
     *   1. User clicks "Forgot Password"
     *   2. Enters email address
     *   3. Sees success message (whether account exists or not)
     *   4. If account exists, user gets email with link
     *   5. User clicks link → frontend shows password reset form
     *   6. User enters new password
     *   7. Frontend calls reset-password endpoint
     *   8. System validates token and password
     *   9. Password updated
     *   10. User sees success message
     *   11. User can login with new password
     * 
     * SECURITY NOTE:
     *   Always returns "success" whether account exists or not.
     *   This is intentional - prevents attackers from discovering valid emails.
     *   If account doesn't exist, no email is sent (but user can't tell).
     * 
     * @param request ForgotPasswordRequest containing email
     * @return HTTP 200 with generic success message (always)
     * 
     * @see ForgotPasswordRequest for request structure
     * @see #resetPassword(ResetPasswordRequest) for next step
     */
    @PostMapping("/api/auth/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        // Call service to generate token and send reset email
        passwordService.forgotPassword(request);
        // Always return success — prevents email enumeration attack
        return ResponseEntity.ok(
                ApiResponse.success(
                        "If an account with that email exists, a reset link has been sent.",
                        null)
        );
    }

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Reset Password - Set New Password with Reset Token
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Completes password reset process using token from reset email.
     *   User provides new password and reset token to change their password.
     *   No authentication required (uses token-based validation).
     * 
     * ENDPOINT:
     *   POST /api/auth/reset-password
     *   Content-Type: application/json
     *   No authentication required
     * 
     * REQUEST BODY:
     *   {
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     "newPassword": "SecureNewPassword123!"
     *   }
     * 
     * VALIDATION:
     *   - Token is required and must be valid
     *   - Token must not be expired (24 hour limit)
     *   - Token must not be already used
     *   - New password must meet complexity requirements:
     *     ├─ Minimum 8 characters
     *     ├─ Must include uppercase (A-Z)
     *     ├─ Must include lowercase (a-z)
     *     ├─ Must include number (0-9)
     *     └─ Must include special character (!@#$%^&*)
     *   - New password cannot match old password
     *   - New password cannot match previous 3 passwords
     * 
     * EXAMPLE REQUEST:
     *   POST /api/auth/reset-password
     *   {
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     "newPassword": "SecureNewPass123!"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Password reset successfully. You can now sign in.",
     *     "data": null
     *   }
     * 
     * EXAMPLE ERROR RESPONSE (400 BAD REQUEST):
     *   {
     *     "success": false,
     *     "message": "Reset link has expired. Please request a new reset.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Password reset successfully
     *   400 BAD REQUEST     - Token invalid/expired or password invalid
     *   401 UNAUTHORIZED    - Token validation failed
     *   404 NOT FOUND       - User not found for token
     *   500 INTERNAL ERROR  - System error
     * 
     * PASSWORD REQUIREMENTS (must satisfy ALL):
     *   ✓ Minimum 8 characters (e.g., "Secure123!")
     *   ✓ At least one uppercase letter (A-Z)
     *   ✓ At least one lowercase letter (a-z)
     *   ✓ At least one number (0-9)
     *   ✓ At least one special character (!@#$%^&*)
     * 
     * EXAMPLE VALID PASSWORDS:
     *   - "SecurePass123!"
     *   - "MyFleet@2024"
     *   - "Drivers#NewPass"
     *   - "Reset@Pwd2024"
     * 
     * EXAMPLE INVALID PASSWORDS:
     *   - "password" (no uppercase, no number, no special)
     *   - "Password123" (no special character)
     *   - "Pass1!" (too short)
     *   - "PASSWORD123!" (no lowercase)
     * 
     * WHAT HAPPENS:
     *   1. Validates token provided
     *   2. Decodes token to extract user information
     *   3. Checks token has not expired (24 hour limit)
     *   4. Checks token not already used
     *   5. Validates new password meets complexity
     *   6. Checks password not same as previous passwords
     *   7. Looks up user by email from token
     *   8. Hashes new password with BCrypt
     *   9. Updates password in database
     *   10. Invalidates reset token (one-time use)
     *   11. Clears old sessions (forces login)
     *   12. Logs password change event
     *   13. Returns success message
     * 
     * TOKEN VALIDATION:
     *   - Token must be valid JWT format
     *   - Token must contain user email
     *   - Token signature must be correct
     *   - Token must not be expired
     *   - Token must not be marked as used
     * 
     * FAILURE SCENARIOS:
     *   
     *   Token Expired:
     *   - Error: "Reset link has expired. Please request a new reset."
     *   - Action: User calls /api/auth/forgot-password again
     * 
     *   Token Invalid:
     *   - Error: "Invalid reset link. Request a new password reset."
     *   - Action: User calls /api/auth/forgot-password again
     * 
     *   Token Already Used:
     *   - Error: "This reset link has already been used. Request a new reset."
     *   - Action: User calls /api/auth/forgot-password again
     * 
     *   Password Too Weak:
     *   - Error: "Password does not meet complexity requirements."
     *   - Action: User chooses stronger password
     * 
     *   Password Reused:
     *   - Error: "Password recently used. Choose a different password."
     *   - Action: User chooses new password
     * 
     * PASSWORD HASHING:
     *   - Algorithm: BCrypt
     *   - Cost factor: 10
     *   - Salt: Automatically generated per password
     *   - Original password never stored
     *   - Hashed password stored in database
     *   - Comparison uses constant-time algorithm
     * 
     * SECURITY FEATURES:
     *   - Token validated before password update
     *   - Token single-use (becomes invalid immediately)
     *   - Password hashed and salted
     *   - Old sessions invalidated (forces login)
     *   - Change logged in audit trail
     *   - User notified via email
     *   - Rate limited: Max 5 resets per email per hour
     * 
     * AFTER PASSWORD RESET:
     *   - Old password no longer works
     *   - All existing sessions invalidated
     *   - User must login with new password
     *   - User receives confirmation email
     *   - If user didn't request reset: Contact support
     * 
     * TOKEN DETAILS:
     *   - Sent in reset email
     *   - Includes expiration time
     *   - Unique per reset request
     *   - Cannot be reused after use
     *   - Cannot be forged (signed)
     * 
     * TYPICAL WORKFLOW (from user perspective):
     *   1. Click "Forgot Password" link
     *   2. Enter email address
     *   3. Receive email with reset link
     *   4. Click link in email
     *   5. Prompted to enter new password
     *   6. Enter valid new password
     *   7. See "Password reset successfully" message
     *   8. Can login with new password
     * 
     * AFTER SUCCESSFUL RESET:
     *   - User can immediately login with new password
     *   - Old password is no longer valid
     *   - All old login sessions end
     *   - Reset token destroyed
     *   - Confirmation email sent
     * 
     * SECURITY NOTE:
     *   Do not share reset links or tokens with others.
     *   Token is equivalent to password reset access.
     *   Keep token secure until used.
     * 
     * @param request ResetPasswordRequest with token and new password
     * @return HTTP 200 with success message
     * @throws InvalidTokenException if token invalid/expired
     * @throws ValidationException if password invalid
     * 
     * @see ResetPasswordRequest for request structure
     * @see #forgotPassword(ForgotPasswordRequest) to request reset token
     */
    @PostMapping("/api/auth/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        // Call service to validate token and update password
        passwordService.resetPassword(request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password reset successfully. You can now sign in.",
                        null)
        );
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ████████████████  A U T H E N T I C A T E D   E P  ██████████████████████
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * ═══════════════════════════════════════════════════════════════════════════
     * Change Password - Authenticated User Changes Their Password
     * ═══════════════════════════════════════════════════════════════════════════
     * 
     * PURPOSE:
     *   Allows logged-in users to change their own password.
     *   Different from password reset - requires current password verification.
     *   For users who know their current password and want to change it.
     * 
     * ENDPOINT:
     *   POST /api/user/change-password
     *   Content-Type: application/json
     *   Authentication required: YES (Bearer token)
     * 
     * AUTHENTICATION:
     *   Include JWT token in header:
     *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     * 
     * REQUEST BODY:
     *   {
     *     "currentPassword": "OldSecurePass123!",
     *     "newPassword": "NewSecurePass456!"
     *   }
     * 
     * VALIDATION:
     *   - User must be authenticated (token required)
     *   - Current password is required
     *   - New password is required
     *   - Current password must match user's actual password
     *   - New password must meet complexity requirements:
     *     ├─ Minimum 8 characters
     *     ├─ Must include uppercase (A-Z)
     *     ├─ Must include lowercase (a-z)
     *     ├─ Must include number (0-9)
     *     └─ Must include special character (!@#$%^&*)
     *   - New password cannot match current password
     *   - New password cannot match previous 3 passwords
     * 
     * EXAMPLE REQUEST:
     *   POST /api/user/change-password
     *   Authorization: Bearer eyJhbGc...
     *   {
     *     "currentPassword": "OldPass123!",
     *     "newPassword": "NewPass456!"
     *   }
     * 
     * EXAMPLE RESPONSE (200 OK):
     *   {
     *     "success": true,
     *     "message": "Password changed successfully.",
     *     "data": null
     *   }
     * 
     * EXAMPLE ERROR RESPONSE (401 UNAUTHORIZED):
     *   {
     *     "success": false,
     *     "message": "Current password is incorrect.",
     *     "data": null
     *   }
     * 
     * HTTP STATUS CODES:
     *   200 OK              - Password changed successfully
     *   400 BAD REQUEST     - Validation failed (check message)
     *   401 UNAUTHORIZED    - Current password incorrect or not authenticated
     *   403 FORBIDDEN       - Account security issue
     *   500 INTERNAL ERROR  - System error
     * 
     * PASSWORD REQUIREMENTS (must satisfy ALL):
     *   ✓ Minimum 8 characters
     *   ✓ At least one uppercase letter (A-Z)
     *   ✓ At least one lowercase letter (a-z)
     *   ✓ At least one number (0-9)
     *   ✓ At least one special character (!@#$%^&*)
     *   ✓ Different from current password
     * 
     * WHAT HAPPENS:
     *   1. Validates user is authenticated
     *   2. Gets current user from JWT token
     *   3. Validates current password provided
     *   4. Validates new password provided
     *   5. Compares provided current password with stored password
     *   6. If mismatch: Returns error (doesn't reveal password is wrong)
     *   7. Validates new password meets complexity requirements
     *   8. Checks new password not same as current
     *   9. Checks new password not in last 3 passwords
     *   10. Hashes new password with BCrypt
     *   11. Updates password in database
     *   12. Archives current password (for history)
     *   13. Invalidates all existing sessions (forces re-login)
     *   14. Logs password change event
     *   15. Returns success message
     * 
     * FAILURE SCENARIOS:
     * 
     *   Current Password Wrong:
     *   - Error: "Current password is incorrect."
     *   - Action: User re-enters correct current password
     * 
     *   Not Authenticated:
     *   - Error: "Unauthorized" (401)
     *   - Action: User must login first
     * 
     *   New Password Too Weak:
     *   - Error: "Password does not meet complexity requirements."
     *   - Action: User chooses stronger password
     * 
     *   New Password Same as Current:
     *   - Error: "New password must be different from current password."
     *   - Action: User chooses different password
     * 
     *   Recent Password Reuse:
     *   - Error: "Cannot reuse recent password. Choose a different one."
     *   - Action: User chooses new password not used in last 3 changes
     * 
     * PASSWORD VERIFICATION:
     *   - Current password compared using BCrypt comparison
     *   - Uses constant-time comparison (prevents timing attacks)
     *   - Original password never sent in logs
     *   - Hashed password never returned to user
     * 
     * PASSWORD HASHING:
     *   - New password hashed with BCrypt
     *   - Cost factor: 10
     *   - Salt: Auto-generated per password
     *   - Original password never stored
     *   - Hashed password stored in database
     * 
     * PASSWORD HISTORY:
     *   - Last 3 passwords stored (hashed)
     *   - Cannot reuse recent passwords
     *   - Prevents weak password cycling
     *   - History cleared when password changed
     * 
     * SESSION INVALIDATION:
     *   - All existing login sessions invalidated
     *   - User must login again with new password
     *   - Other devices logged out
     *   - API tokens become invalid
     *   - Forces security refresh across all sessions
     * 
     * SECURITY FEATURES:
     *   - Requires authentication (only user can change own)
     *   - Requires current password (prevents unauthorized change)
     *   - Password hashed and salted
     *   - Password history enforced
     *   - Sessions invalidated (forces re-login)
     *   - Change logged in audit trail
     *   - Confirmation email sent
     *   - Rate limited: Max 3 changes per day
     * 
     * RATE LIMITING:
     *   - Maximum 3 password changes per user per day
     *   - After limit: Must wait until next day
     *   - Prevents abuse (e.g., rapid password cycling)
     * 
     * AUDIT TRAIL:
     *   - Change timestamp recorded
     *   - User ID recorded
     *   - IP address recorded
     *   - Success/failure logged
     *   - Cannot be deleted (immutable log)
     * 
     * AFTER SUCCESSFUL CHANGE:
     *   - Old password no longer works
     *   - User must use new password for login
     *   - All sessions invalidated
     *   - User redirected to login
     *   - Confirmation email sent
     * 
     * EMAIL NOTIFICATION:
     *   User receives confirmation email:
     *   - Change timestamp
     *   - Device/location info
     *   - Note: "If not you, contact support immediately"
     *   - Option to revert (if within time limit)
     * 
     * WHO CAN USE:
     *   - Authenticated users only
     *   - User can only change their own password
     *   - Admin can force password reset for other users (different endpoint)
     * 
     * TYPICAL WORKFLOW (from user perspective):
     *   1. User logged in
     *   2. Clicks "Change Password" in settings
     *   3. Enters current password
     *   4. Enters new password (twice for confirmation)
     *   5. System validates inputs
     *   6. Sees "Password changed successfully" message
     *   7. Logged out and redirected to login
     *   8. Logs back in with new password
     * 
     * COMPARISON: Change vs Reset Password:
     *   
     *   Change Password (/api/user/change-password):
     *   - User is logged in
     *   - Requires current password
     *   - Doesn't need token or email
     *   - Immediate change
     *   
     *   Reset Password (/api/auth/reset-password):
     *   - User is not logged in (or forgot password)
     *   - Uses email-based token
     *   - Does not require current password
     *   - Account recovery scenario
     * 
     * @param user          Currently authenticated user (from JWT token)
     * @param request       ChangePasswordRequest with current & new password
     * @return              HTTP 200 with success message
     * @throws              AuthenticationException if current password wrong
     * @throws              ValidationException if new password invalid
     * 
     * @see ChangePasswordRequest for request structure
     */
    @PostMapping("/api/user/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ChangePasswordRequest request) {
        // Call service to validate current password and update with new password
        passwordService.changePassword(user, request);
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Password changed successfully.",
                        null)
        );
    }
}
