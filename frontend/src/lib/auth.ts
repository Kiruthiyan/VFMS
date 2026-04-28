// Shared auth types used by middleware, layouts, and role-aware navigation.
// The actual login and registration flows live in the auth feature branch.

export type UserRole = "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";

export interface AuthUser {
  email: string;
  fullName: string;
  role: UserRole;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  APPROVER: "Approver",
  SYSTEM_USER: "Staff / System User",
  DRIVER: "Driver",
};

export const ROLE_REDIRECTS: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  APPROVER: "/approvals/dashboard",
  SYSTEM_USER: "/dashboard",
  DRIVER: "/driver/dashboard",
};

export const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/signup"];

// Public routes are checked with prefix matching so nested auth pages can stay accessible.
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}