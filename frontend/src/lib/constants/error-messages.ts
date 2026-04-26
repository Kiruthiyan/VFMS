/**
 * Centralized error messages used across the application
 * Single source of truth for user-facing error messages
 */

export const ERROR_MESSAGES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_DISABLED: 'Your account is disabled. Contact your administrator.',
  EMAIL_NOT_VERIFIED: 'Please verify your email first.',
  ACCOUNT_PENDING: 'Your account is still pending approval. Please check your email later.',
  
  // Validation errors
  PASSWORD_MISMATCH: 'Passwords do not match',
  NEW_PASSWORD_SAME: 'New password must be different from your current password',
  INVALID_CURRENT_PASSWORD: 'Current password is incorrect',
  PASSWORD_TOO_WEAK: 'Password must contain: uppercase, lowercase, digit, special character (@$!%*?&)',
  EMAIL_ALREADY_EXISTS: 'Email address already registered',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address',
  INVALID_PHONE_FORMAT: 'Phone number must be 10-15 digits',
  INVALID_NIC_FORMAT: 'NIC must be 9-12 characters',
  
  // Email verification
  VERIFICATION_LINK_EXPIRED: 'Verification link has expired. Please request a new one.',
  INVALID_VERIFICATION_TOKEN: 'Invalid or expired verification link.',
  OTP_INVALID: 'Invalid verification code provided',
  OTP_EXPIRED: 'Verification code has expired. Please request a new one.',
  
  // Password reset
  RESET_LINK_EXPIRED: 'Reset link has expired. Please request a new one.',
  INVALID_RESET_TOKEN: 'Invalid or expired reset link. Please request a new one.',
  
  // General errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FORM_SUBMISSION_FAILED: 'Unable to submit form. Please try again.',
  UNAUTHORIZED: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  
  // Success messages
  PASSWORD_CHANGED_SUCCESS: 'Password changed successfully!',
  EMAIL_VERIFIED_SUCCESS: 'Email verified successfully!',
  ACCOUNT_CREATED_SUCCESS: 'Account created successfully! Please verify your email.',
  SIGNED_OUT_SUCCESS: 'Signed out successfully.',
} as const;

export const AUTH_ERROR_MESSAGES = {
  401: ERROR_MESSAGES.INVALID_CREDENTIALS,
  403: ERROR_MESSAGES.ACCOUNT_DISABLED,
  400: ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
} as const;
