/**
 * Email configuration and URL generation
 * Centralizes email-related settings, URLs, and helper functions
 * Ensures consistency across email verification, password reset, and notifications
 * 
 * Usage: import { EMAIL_CONFIG, getVerificationUrl } from '@/lib/constants/email-config'
 */

/**
 * Email configuration object containing URLs, expiry times, and branding
 */
export const EMAIL_CONFIG = {
  // Base URL for building complete email links (should be set from environment)
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Email expiry times (in minutes)
  verificationEmailExpiryMinutes: 5,
  passwordResetEmailExpiryMinutes: 60,
  
  // Email display settings
  senderEmail: process.env.NEXT_PUBLIC_SENDER_EMAIL || 'noreply@vfms.com',
  appName: 'VFMS',
  
  // Branding colors (used in email templates)
  brandColor: '#0B1736',
  brandLightBg: '#F5F7FB',
  accentColor: '#F4B400',
  
  // Support contact
  supportEmail: 'support@vfms.com',
};

/**
 * Generate verification email URL with token
 * Used in email templates to create clickable verification links
 * 
 * @param email - User's email address
 * @param token - Verification token
 * @returns Complete verification URL
 * 
 * @example
 * const url = getVerificationUrl('user@example.com', 'token123');
 * // Returns: http://localhost:3000/auth/verify-email?email=user@example.com&token=token123
 */
export function getVerificationUrl(email: string, token: string): string {
  const params = new URLSearchParams({
    email,
    token,
  });
  return `${EMAIL_CONFIG.baseUrl}/auth/verify-email?${params.toString()}`;
}

/**
 * Generate password reset URL with token
 * Used in password reset emails to create secure reset links
 * 
 * @param email - User's email address
 * @param token - Reset token
 * @returns Complete password reset URL
 * 
 * @example
 * const url = getPasswordResetUrl('user@example.com', 'token123');
 * // Returns: http://localhost:3000/auth/reset-password?email=user@example.com&token=token123
 */
export function getPasswordResetUrl(email: string, token: string): string {
  const params = new URLSearchParams({
    email,
    token,
  });
  return `${EMAIL_CONFIG.baseUrl}/auth/reset-password?${params.toString()}`;
}

/**
 * Generate login URL
 * Used in welcome emails to guide users to login page
 * 
 * @returns Complete login URL
 * 
 * @example
 * const url = getLoginUrl();
 * // Returns: http://localhost:3000/auth/login
 */
export function getLoginUrl(): string {
  return `${EMAIL_CONFIG.baseUrl}/auth/login`;
}

/**
 * Email template subjects - Consistent across system
 */
export const EMAIL_SUBJECTS = {
  VERIFICATION: 'VFMS – Verify Your Email',
  PASSWORD_RESET: 'VFMS – Reset Your Password',
  WELCOME: 'VFMS – Welcome! Your Account Has Been Created',
  APPROVAL: 'VFMS – Your Account Has Been Approved',
  REJECTION: 'VFMS – Account Registration Update',
};

/**
 * Email template messages - Reusable snippets
 */
export const EMAIL_MESSAGES = {
  VERIFY_INTRO: 'Please use the following code to verify your email address:',
  VERIFY_EXPIRY: 'This code expires in 5 minutes.',
  RESET_INTRO: 'Click the link below to reset your password:',
  RESET_EXPIRY: 'This link expires in 1 hour.',
  WELCOME_INTRO: 'An administrator has created a VFMS account for you.',
  APPROVAL_INTRO: 'Congratulations! Your account has been approved.',
  REJECTION_INTRO: 'We regret to inform you that your account registration has not been approved.',
};
