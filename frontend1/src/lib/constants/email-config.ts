const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const EMAIL_CONFIG = {
  APP_URL,
  VERIFY_EMAIL_PATH: "/auth/verify-email",
  LOGIN_PATH: "/auth/login",
  FORGOT_PASSWORD_PATH: "/auth/forgot-password",
  RESET_PASSWORD_PATH: "/auth/reset-password",
  VERIFICATION_EXPIRY_HOURS: 24,
  PASSWORD_RESET_EXPIRY_HOURS: 1,
  OTP_VALIDITY_MINUTES: 5,
  BRAND_NAME: "VFMS",
  BRAND_FULL: "Vehicle Fleet Management System",
  SUPPORT_EMAIL: "support@vfms.local",
} as const;

function buildUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, EMAIL_CONFIG.APP_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

export function getVerificationUrl(baseOrEmail: string, token: string): string {
  if (baseOrEmail.startsWith("http://") || baseOrEmail.startsWith("https://")) {
    return `${baseOrEmail}${EMAIL_CONFIG.VERIFY_EMAIL_PATH}?token=${token}`;
  }

  return buildUrl(EMAIL_CONFIG.VERIFY_EMAIL_PATH, {
    email: baseOrEmail,
    token,
  });
}

export function getPasswordResetUrl(baseOrEmail: string, token: string): string {
  if (baseOrEmail.startsWith("http://") || baseOrEmail.startsWith("https://")) {
    return `${baseOrEmail}${EMAIL_CONFIG.RESET_PASSWORD_PATH}?token=${token}`;
  }

  return buildUrl(EMAIL_CONFIG.RESET_PASSWORD_PATH, {
    email: baseOrEmail,
    token,
  });
}

export function getLoginUrl(baseUrl?: string): string {
  return buildUrl(
    EMAIL_CONFIG.LOGIN_PATH,
    baseUrl ? { redirectBase: baseUrl } : undefined
  ).replace("?redirectBase=" + encodeURIComponent(baseUrl ?? ""), "");
}

export const EMAIL_SUBJECTS = {
  VERIFICATION: "VFMS - Verify Your Email",
  PASSWORD_RESET: "VFMS - Reset Your Password",
  WELCOME: "VFMS - Welcome! Your Account Has Been Created",
  APPROVAL: "VFMS - Your Account Has Been Approved",
  REJECTION: "VFMS - Account Registration Update",
} as const;

export const EMAIL_MESSAGES = {
  VERIFY_INTRO: "Please use the following code to verify your email address:",
  VERIFY_EXPIRY: "This code expires in 5 minutes.",
  RESET_INTRO: "Click the link below to reset your password:",
  RESET_EXPIRY: "This link expires in 1 hour.",
  WELCOME_INTRO: "An administrator has created a VFMS account for you.",
  APPROVAL_INTRO: "Congratulations! Your account has been approved.",
  REJECTION_INTRO:
    "We regret to inform you that your account registration has not been approved.",
} as const;
