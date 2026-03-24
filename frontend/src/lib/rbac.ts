import type { UserRole } from "@/lib/api/auth";

// ── ROLE CONFIG ───────────────────────────────────────────────────────────

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  APPROVER: "/approvals/dashboard",
  SYSTEM_USER: "/dashboard",
  DRIVER: "/driver/dashboard",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  APPROVER: "Approver",
  SYSTEM_USER: "Staff",
  DRIVER: "Driver",
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "text-red-400 bg-red-950/40 border-red-800/40",
  APPROVER: "text-purple-400 bg-purple-950/40 border-purple-800/40",
  SYSTEM_USER: "text-blue-400 bg-blue-950/40 border-blue-800/40",
  DRIVER: "text-green-400 bg-green-950/40 border-green-800/40",
};

// ── ROUTE OWNERSHIP ───────────────────────────────────────────────────────

export const ROUTE_ROLES: { prefix: string; role: UserRole }[] = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/approvals", role: "APPROVER" },
  { prefix: "/dashboard", role: "SYSTEM_USER" },
  { prefix: "/driver", role: "DRIVER" },
];

export function getRouteOwner(pathname: string): UserRole | null {
  const match = ROUTE_ROLES.find((r) => pathname.startsWith(r.prefix));
  return match ? match.role : null;
}

export function canAccess(
  userRole: UserRole | undefined,
  pathname: string
): boolean {
  const requiredRole = getRouteOwner(pathname);
  if (!requiredRole) return true; // no restriction
  return userRole === requiredRole;
}

// ── COOKIE HELPERS (used by auth-store on login/logout) ───────────────────

export function setAuthCookies(token: string, role: string): void {
  if (typeof document === "undefined") return;
  // 7 days
  const expires = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `vfms-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `vfms-role=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") return;
  document.cookie = "vfms-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "vfms-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
