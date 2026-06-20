"use client";

import { usePathname } from "next/navigation";

import { RoleGuard } from "@/components/auth/role-guard";
import type { UserRole } from "@/lib/auth";

const FLEET_VIEW_ROLES: UserRole[] = ["ADMIN", "SYSTEM_USER", "APPROVER"];
const VENDOR_VIEW_ROLES: UserRole[] = ["ADMIN", "SYSTEM_USER"];
const FLEET_CREATE_ROLES: UserRole[] = ["ADMIN", "SYSTEM_USER"];
const FLEET_ADMIN_ROLES: UserRole[] = ["ADMIN"];

function isAdminOnlyFleetPath(pathname: string): boolean {
  return (
    pathname === "/dashboards/fleet/vehicles/add" ||
    /^\/dashboards\/fleet\/vehicles\/[^/]+\/edit$/.test(pathname) ||
    pathname === "/dashboards/fleet/vendors/add" ||
    /^\/dashboards\/fleet\/vendors\/[^/]+\/edit$/.test(pathname)
  );
}

function isCreateOrEditFleetPath(pathname: string): boolean {
  return (
    pathname === "/dashboards/fleet/maintenance/create" ||
    /^\/dashboards\/fleet\/maintenance\/[^/]+\/edit$/.test(pathname) ||
    pathname === "/dashboards/fleet/rentals/create" ||
    /^\/dashboards\/fleet\/rentals\/[^/]+\/edit$/.test(pathname)
  );
}

function getAllowedRoles(pathname: string): UserRole[] {
  if (isAdminOnlyFleetPath(pathname)) {
    return FLEET_ADMIN_ROLES;
  }

  if (
    pathname === "/dashboards/fleet/vendors"
  ) {
    return VENDOR_VIEW_ROLES;
  }

  if (/^\/dashboards\/fleet\/vendors\/[^/]+$/.test(pathname)) {
    return FLEET_ADMIN_ROLES;
  }

  if (isCreateOrEditFleetPath(pathname)) {
    return FLEET_CREATE_ROLES;
  }

  return FLEET_VIEW_ROLES;
}

export function FleetAccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <RoleGuard allowedRoles={getAllowedRoles(pathname)}>
      {children}
    </RoleGuard>
  );
}
