// Shared auth types — used across all modules
// Auth functions (login, register, etc.) are in feature/auth-login (Kiruthiyan)

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

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}