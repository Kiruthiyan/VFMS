export const PUBLIC_ROUTES = {
  HOME: "/",
  UNAUTHORIZED: "/unauthorized",
} as const;

export const AUTH_ROUTES = {
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",
  VERIFY_EMAIL: "/auth/verify-email",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  RESEND_VERIFICATION: "/auth/resend-verification",
} as const;

export const DASHBOARD_ROUTES = {
  ADMIN: "/dashboards/admin",
  APPROVER: "/dashboards/approver",
  STAFF: "/dashboards/staff",
  SYSTEM_USER: "/dashboards/staff",
  DRIVER: "/dashboards/driver",
} as const;

export const SETTINGS_ROUTES = {
  CHANGE_PASSWORD: "/settings/change-password",
} as const;

export const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: DASHBOARD_ROUTES.ADMIN,
  APPROVER: DASHBOARD_ROUTES.APPROVER,
  STAFF: DASHBOARD_ROUTES.STAFF,
  SYSTEM_USER: DASHBOARD_ROUTES.SYSTEM_USER,
  DRIVER: DASHBOARD_ROUTES.DRIVER,
};

export const DEFAULT_ROUTES = {
  LOGIN: AUTH_ROUTES.LOGIN,
  DEFAULT_DASHBOARD: DASHBOARD_ROUTES.SYSTEM_USER,
  HOME: PUBLIC_ROUTES.HOME,
  UNAUTHORIZED: PUBLIC_ROUTES.UNAUTHORIZED,
} as const;

export const API_ENDPOINTS = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/register",
  REFRESH_TOKEN: "/api/auth/refresh",
  VERIFY_EMAIL: "/api/auth/verify-email",
  RESEND_VERIFICATION: "/api/auth/resend-verification",
  FORGOT_PASSWORD: "/api/auth/forgot-password",
  RESET_PASSWORD: "/api/auth/reset-password",
  REQUEST_OTP: "/api/auth/send-otp",
  VERIFY_OTP: "/api/auth/verify-otp",
  GET_CURRENT_USER: "/api/user/me",
  CHANGE_PASSWORD: "/api/user/change-password",
  GET_PENDING_USERS: "/api/admin/users/pending",
  APPROVE_USER: "/api/admin/users/{userId}/review",
  REJECT_USER: "/api/admin/users/{userId}/review",
} as const;

export const PROTECTED_ROUTES = [
  DASHBOARD_ROUTES.ADMIN,
  DASHBOARD_ROUTES.APPROVER,
  DASHBOARD_ROUTES.SYSTEM_USER,
  DASHBOARD_ROUTES.DRIVER,
  SETTINGS_ROUTES.CHANGE_PASSWORD,
];

export const UNPROTECTED_ROUTES = [
  PUBLIC_ROUTES.HOME,
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.VERIFY_EMAIL,
  AUTH_ROUTES.RESET_PASSWORD,
];

export const ALWAYS_ACCESSIBLE = [
  PUBLIC_ROUTES.HOME,
  PUBLIC_ROUTES.UNAUTHORIZED,
];
