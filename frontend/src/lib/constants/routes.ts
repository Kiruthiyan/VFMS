/**
 * Centralized routes configuration
 * Single source of truth for all application URLs
 * 
 * Benefits:
 * - Prevents hardcoded route strings scattered across code
 * - Ensures consistency across redirects and links
 * - Easy to refactor - change routes in one place
 * - Type-safe route access with TypeScript
 */

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────
export const PUBLIC_ROUTES = {
  HOME: '/',
  UNAUTHORIZED: '/unauthorized',
} as const;

// ─── AUTHENTICATION ROUTES ───────────────────────────────────────────────
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  VERIFY_EMAIL: '/auth/verify-email',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  RESEND_VERIFICATION: '/auth/resend-verification',
} as const;

// ─── DASHBOARD ROUTES (ROLE-BASED) ──────────────────────────────────────
export const DASHBOARD_ROUTES = {
  ADMIN: '/dashboards/admin',
  APPROVER: '/dashboards/approver',
  STAFF: '/dashboards/staff',
  DRIVER: '/dashboards/driver',
} as const;

// ─── SETTINGS ROUTES ────────────────────────────────────────────────────
export const SETTINGS_ROUTES = {
  CHANGE_PASSWORD: '/settings/change-password',
} as const;

// ─── ROLE-BASED REDIRECTS ──────────────────────────────────────────────
/**
 * Maps user roles to their default dashboard URLs
 * Used after login to redirect users to their role-specific dashboard
 * 
 * @example
 * const dashboardUrl = ROLE_DASHBOARDS[userRole] ?? DASHBOARD_ROUTES.STAFF;
 */
export const ROLE_DASHBOARDS: Record<string, string> = {
  ADMIN: DASHBOARD_ROUTES.ADMIN,
  APPROVER: DASHBOARD_ROUTES.APPROVER,
  STAFF: DASHBOARD_ROUTES.STAFF,
  DRIVER: DASHBOARD_ROUTES.DRIVER,
};

// ─── DEFAULT ROUTES ────────────────────────────────────────────────────
/**
 * Default fallback routes for error handling
 */
export const DEFAULT_ROUTES = {
  LOGIN: AUTH_ROUTES.LOGIN,
  DEFAULT_DASHBOARD: DASHBOARD_ROUTES.STAFF,
  HOME: PUBLIC_ROUTES.HOME,
  UNAUTHORIZED: PUBLIC_ROUTES.UNAUTHORIZED,
} as const;

// ─── API ENDPOINTS (CLIENT-SIDE) ───────────────────────────────────────
/**
 * API endpoint paths (relative to API base URL)
 * These should match backend route definitions
 */
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  REFRESH_TOKEN: '/api/auth/refresh-token',
  VERIFY_EMAIL: '/api/auth/verify-email',
  RESEND_VERIFICATION: '/api/auth/resend-verification',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  REQUEST_OTP: '/api/auth/request-otp',
  VERIFY_OTP: '/api/auth/verify-otp',
  
  // User endpoints
  GET_CURRENT_USER: '/api/users/me',
  CHANGE_PASSWORD: '/api/users/change-password',
  
  // Admin endpoints
  GET_PENDING_USERS: '/api/admin/users/pending',
  APPROVE_USER: '/api/admin/users/approve',
  REJECT_USER: '/api/admin/users/reject',
} as const;

// ─── ROUTE GROUPS ─────────────────────────────────────────────────────
/**
 * Grouped routes for middleware and access control
 */
export const PROTECTED_ROUTES = [
  DASHBOARD_ROUTES.ADMIN,
  DASHBOARD_ROUTES.APPROVER,
  DASHBOARD_ROUTES.STAFF,
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

/**
 * Routes that require no authentication
 * These are accessible to anyone, including authenticated users
 */
export const ALWAYS_ACCESSIBLE = [
  PUBLIC_ROUTES.HOME,
  PUBLIC_ROUTES.UNAUTHORIZED,
];
