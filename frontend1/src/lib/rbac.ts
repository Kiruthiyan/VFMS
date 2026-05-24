import type { UserRole } from "@/lib/auth";

export const ROLE_HOME: Record<UserRole, string> = {
  ADMIN: "/dashboards/admin",
  APPROVER: "/dashboards/approver",
  SYSTEM_USER: "/dashboards/staff",
  DRIVER: "/dashboards/driver",
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

export const ROUTE_ROLES: { prefix: string; role: UserRole }[] = [
  { prefix: "/dashboards/admin", role: "ADMIN" },
  { prefix: "/dashboards/approver", role: "APPROVER" },
  { prefix: "/dashboards/staff", role: "SYSTEM_USER" },
  { prefix: "/dashboards/driver", role: "DRIVER" },
  { prefix: "/admin", role: "ADMIN" },
];

export function getRouteOwner(pathname: string): UserRole | null {
  const match = ROUTE_ROLES.find((route) => pathname.startsWith(route.prefix));
  return match ? match.role : null;
}

export function canAccess(
  userRole: UserRole | undefined,
  pathname: string
): boolean {
  const requiredRole = getRouteOwner(pathname);
  if (!requiredRole) {
    return true;
  }

  return userRole === requiredRole;
}

export function setAuthCookies(token: string, role: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const expires = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  ).toUTCString();
  document.cookie = `vfms-token=${token}; path=/; expires=${expires}; SameSite=Lax`;
  document.cookie = `vfms-role=${role}; path=/; expires=${expires}; SameSite=Lax`;
}

export function clearAuthCookies(): void {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = "vfms-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "vfms-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
