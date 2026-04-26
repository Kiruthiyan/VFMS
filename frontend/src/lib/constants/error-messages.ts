/**
<<<<<<< HEAD
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
=======
 * User-facing error messages - Single source of truth for all API error messages
 * Imported and used across all components for consistent error communication
 * 
 * Organization: Categorized by error type (Auth, Validation, Email, etc.)
 * Usage: import { ERROR_MESSAGES } from '@/lib/constants/error-messages'
 */

export const ERROR_MESSAGES = {
  // Authentication Errors (401)
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHENTICATED: 'Please log in to continue',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again',
  UNAUTHORIZED: 'You do not have permission to access this resource',
  
  // Validation Errors (400)
  VALIDATION_ERROR: 'Please check your input and try again',
  INVALID_EMAIL: 'Please enter a valid email address',
  EMAIL_ALREADY_EXISTS: 'This email is already registered',
  INVALID_PASSWORD: 'Password must contain uppercase, lowercase, digit, and special character',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  
  // OTP Errors
  INVALID_OTP: 'Invalid or expired OTP code',
  OTP_EXPIRED: 'OTP has expired. Please request a new one',
  OTP_NOT_SENT: 'Failed to send OTP code',
  
  // Email Errors
  EMAIL_VERIFICATION_FAILED: 'Email verification failed',
  EMAIL_ALREADY_VERIFIED: 'Email is already verified',
  
  // Password Reset Errors
  PASSWORD_RESET_LINK_EXPIRED: 'Password reset link has expired. Please request a new one',
  CURRENT_PASSWORD_INCORRECT: 'Your current password is incorrect',
  NEW_PASSWORD_SAME_AS_OLD: 'New password cannot be the same as current password',
  
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
  
  // Specific Domain Errors
  USER_NOT_FOUND: 'User not found',
  USER_DEACTIVATED: 'This account has been deactivated',
  USER_NOT_APPROVED: 'Your account is pending approval',
  
  // Success Messages
  SUCCESS_LOGIN: 'Logged in successfully',
  SUCCESS_SIGNUP: 'Account created successfully. Please verify your email',
  SUCCESS_EMAIL_VERIFIED: 'Email verified successfully',
  SUCCESS_PASSWORD_RESET: 'Password reset successfully',
  SUCCESS_PASSWORD_CHANGED: 'Password changed successfully',
};

/**
 * Map HTTP error status codes to user-friendly messages
 * Used by Axios interceptors to provide context-aware error messages
 */
export const AUTH_ERROR_MESSAGES: Record<number, string> = {
  400: 'Request failed. Please check your input',
  401: ERROR_MESSAGES.INVALID_CREDENTIALS,
  403: ERROR_MESSAGES.UNAUTHORIZED,
  404: 'Resource not found',
  409: 'Resource already exists',
  422: 'Validation failed',
  429: 'Too many attempts. Please try again later',
  500: ERROR_MESSAGES.SERVER_ERROR,
  503: 'Service temporarily unavailable',
};

/**
 * Get error message based on error object
 * Handles Axios errors, validation errors, and generic errors
 * 
 * @param error - Error object from Axios or other source
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any): string {
  // Handle Axios error responses
  if (error?.response?.status) {
    const statusMessage = AUTH_ERROR_MESSAGES[error.response.status];
    if (statusMessage) {
      return statusMessage;
    }
    
    // Try to get message from API response
    if (error.response.data?.message) {
      return error.response.data.message;
    }
  }
  
  // Handle generic error messages
  if (error?.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
>>>>>>> origin/feature/user-management
