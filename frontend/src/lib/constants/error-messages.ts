export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS:
    "Invalid email or password. Please check your details and try again.",
  ACCOUNT_DISABLED:
    "This account is deactivated. Please contact your administrator.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  ACCOUNT_PENDING:
    "Your account is awaiting administrator approval.",
  PASSWORD_MISMATCH: "The passwords do not match. Please re-enter them carefully.",
  PASSWORDS_DO_NOT_MATCH: "The passwords do not match. Please re-enter them carefully.",
  NEW_PASSWORD_SAME:
    "New password must be different from your current password.",
  NEW_PASSWORD_SAME_AS_OLD:
    "New password cannot be the same as current password.",
  INVALID_CURRENT_PASSWORD: "Current password is incorrect.",
  CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect.",
  PASSWORD_TOO_WEAK:
    "Password must include uppercase, lowercase, number, and special character.",
  INVALID_PASSWORD:
    "Password must include uppercase, lowercase, number, and special character.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  EMAIL_ALREADY_EXISTS: "An account already exists for this email address.",
  INVALID_EMAIL_FORMAT: "Enter a valid email address in the format name@example.com.",
  INVALID_EMAIL: "Enter a valid email address in the format name@example.com.",
  INVALID_PHONE_FORMAT: "Enter a valid Sri Lankan mobile number, for example 0771234567.",
  INVALID_NIC_FORMAT:
    "Enter a valid NIC in either 12-digit format or 9 digits followed by V or X.",
  VERIFICATION_LINK_EXPIRED:
    "Verification link has expired. Please request a new one.",
  INVALID_VERIFICATION_TOKEN: "Invalid or expired verification link.",
  INVALID_OTP: "Invalid or expired OTP code.",
  OTP_INVALID: "Invalid verification code provided.",
  OTP_EXPIRED: "Verification code has expired. Please request a new one.",
  OTP_NOT_SENT: "Failed to send OTP code.",
  EMAIL_VERIFICATION_FAILED: "Email verification failed.",
  EMAIL_ALREADY_VERIFIED: "Email is already verified.",
  RESET_LINK_EXPIRED:
    "Reset link has expired. Please request a new one.",
  PASSWORD_RESET_LINK_EXPIRED:
    "Password reset link has expired. Please request a new one.",
  INVALID_RESET_TOKEN:
    "Invalid or expired reset link. Please request a new one.",
  SOMETHING_WENT_WRONG: "Something went wrong. Please try again in a moment.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
  NETWORK_ERROR: "We could not connect to the server. Please check your connection and try again.",
  SERVER_ERROR: "The server could not complete your request right now. Please try again later.",
  FORM_SUBMISSION_FAILED: "We could not submit your form. Please review your details and try again.",
  UNAUTHENTICATED: "Please log in to continue.",
  UNAUTHORIZED: "You do not have permission to access this resource.",
  TOKEN_EXPIRED: "Your session has expired. Please log in again.",
  VALIDATION_ERROR: "Please review the highlighted information and try again.",
  USER_NOT_FOUND: "User not found.",
  USER_DEACTIVATED: "This account has been deactivated.",
  USER_NOT_APPROVED: "Your account is pending approval.",
  NOT_FOUND: "The requested resource was not found.",
  PASSWORD_CHANGED_SUCCESS: "Password changed successfully!",
  EMAIL_VERIFIED_SUCCESS: "Email verified successfully!",
  ACCOUNT_CREATED_SUCCESS:
    "Your account has been created. Please verify your email to continue.",
  SUCCESS_LOGIN: "Logged in successfully.",
  SUCCESS_SIGNUP: "Your registration has been submitted successfully. Please verify your email.",
  SUCCESS_EMAIL_VERIFIED: "Email verified successfully.",
  SUCCESS_PASSWORD_RESET: "Password reset successfully.",
  SUCCESS_PASSWORD_CHANGED: "Password changed successfully.",
  SIGNED_OUT_SUCCESS: "Signed out successfully.",
} as const;

export const AUTH_ERROR_MESSAGES: Record<number, string> = {
  400: "Request failed. Please check your input.",
  401: ERROR_MESSAGES.INVALID_CREDENTIALS,
  403: ERROR_MESSAGES.UNAUTHORIZED,
  404: "Resource not found.",
  409: "Resource already exists.",
  422: "Validation failed.",
  429: "Too many attempts. Please try again later.",
  500: ERROR_MESSAGES.SERVER_ERROR,
  503: "Service temporarily unavailable.",
};

export function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null
  ) {
    const response = error.response as {
      status?: number;
      data?: { message?: string };
    };

    if (response.status && AUTH_ERROR_MESSAGES[response.status]) {
      return AUTH_ERROR_MESSAGES[response.status];
    }

    if (response.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
