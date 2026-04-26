/**
 * Email configuration constants
 * Defines email URLs and paths used in email templates
 */

export const EMAIL_CONFIG = {
  // Verification email URLs
  VERIFY_EMAIL_PATH: '/auth/verify-email',
  LOGIN_PATH: '/auth/login',
  FORGOT_PASSWORD_PATH: '/auth/forgot-password',
  
  // Email template settings
  VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  OTP_VALIDITY_MINUTES: 5,
  
  // Email branding
  BRAND_NAME: 'FLEETPRO',
  BRAND_FULL: 'Vehicle Fleet Management System',
  SUPPORT_EMAIL: 'support@vfms.local',
} as const;

/**
 * Build verification email URL
 * @param token - Verification token
 * @param baseUrl - Frontend base URL
 * @returns Full verification URL
 */
export function getVerificationUrl(baseUrl: string, token: string): string {
  return `${baseUrl}${EMAIL_CONFIG.VERIFY_EMAIL_PATH}?token=${token}`;
}

/**
 * Build password reset URL
 * @param token - Reset token
 * @param baseUrl - Frontend base URL
 * @returns Full reset URL
 */
export function getPasswordResetUrl(baseUrl: string, token: string): string {
  return `${baseUrl}${EMAIL_CONFIG.FORGOT_PASSWORD_PATH}?token=${token}`;
}

/**
 * Build login URL
 * @param baseUrl - Frontend base URL
 * @returns Full login URL
 */
export function getLoginUrl(baseUrl: string): string {
  return `${baseUrl}${EMAIL_CONFIG.LOGIN_PATH}`;
}
