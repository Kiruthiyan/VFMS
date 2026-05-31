import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Droplets,
  FileText,
  Flag,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Car,
  Wrench,
  Store,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  description?: string;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

export const adminNavigationSections: AdminNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        href: "/dashboards/admin",
        label: "Dashboard",
        icon: LayoutDashboard,
        exact: true,
        description: "System summary and recent activity",
      },
    ],
  },
  {
    title: "User Management",
    items: [
      {
        href: "/admin/users",
        label: "User Dashboard",
        icon: Users,
        exact: true,
        description: "Overview, counts, and management shortcuts",
      },
      {
        href: "/admin/users/all",
        label: "All Users",
        icon: ShieldCheck,
        exact: true,
        description: "Search, filter, and manage user accounts",
      },
      {
        href: "/admin/users/create",
        label: "Create User",
        icon: UserPlus,
        exact: true,
        description: "Provision a new user account with the correct role details",
      },
      {
        href: "/admin/users/deleted",
        label: "Deleted Users",
        icon: Trash2,
        exact: true,
        description: "Audit and restore soft-deleted users",
      },
    ],
  },
  {
    title: "Fleet Management",
    items: [
      {
        href: "/dashboards/fleet/vehicles",
        label: "Vehicles",
        icon: Car,
        exact: false,
        description: "Manage fleet assets and compliance",
      },
      {
        href: "/dashboards/fleet/maintenance",
        label: "Maintenance",
        icon: Wrench,
        exact: false,
        description: "Schedule and track vehicle repairs",
      },
      {
        href: "/dashboards/fleet/rentals",
        label: "Rentals",
        icon: FileText,
        exact: false,
        description: "Manage leased vehicles and contracts",
      },
      {
        href: "/dashboards/fleet/vendors",
        label: "Vendors",
        icon: Store,
        exact: false,
        description: "Manage service and vehicle providers",
      },
    ],
  },
  {
    title: "Fuel Management",
    items: [
      {
        href: "/admin/fuel",
        label: "Fuel Dashboard",
        icon: Droplets,
        exact: true,
        description: "Fuel module overview",
      },
      {
        href: "/admin/fuel/create",
        label: "Add Fuel Entry",
        icon: Droplets,
        exact: true,
        description: "Record a new fuel transaction",
      },
      {
        href: "/admin/fuel/logs",
        label: "Fuel Logs",
        icon: FileText,
        exact: true,
        description: "Browse and filter fuel entries",
      },
      {
        href: "/admin/fuel/alerts",
        label: "Fuel Alerts",
        icon: AlertTriangle,
        exact: true,
        description: "Review detected anomalies",
      },
      {
        href: "/admin/fuel/alerts/flagged",
        label: "Flagged Records",
        icon: Flag,
        exact: true,
        description: "Resolve flagged fuel activity",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        href: "/settings/change-password",
        label: "Change Password",
        icon: LockKeyhole,
        exact: true,
        description: "Update your credentials",
      },
    ],
  },
];

export const adminQuickLinks: AdminNavItem[] = [
  {
    href: "/admin/users",
    label: "User Management",
    icon: Users,
    exact: true,
  },
  {
    href: "/admin/fuel",
    label: "Fuel Management",
    icon: BarChart3,
    exact: true,
  },
];

export const allAdminNavItems = adminNavigationSections.flatMap(
  (section) => section.items
);

function isExactMatch(pathname: string, href: string): boolean {
  return pathname === href;
}

function isNestedMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isAdminNavItemActive(
  pathname: string,
  item: AdminNavItem
): boolean {
  return item.exact ? isExactMatch(pathname, item.href) : isNestedMatch(pathname, item.href);
}

export function getAdminPageTitle(pathname: string): string {
  if (pathname === "/admin/users/create") {
    return "Create User";
  }

  const matchedItem = allAdminNavItems.find((item) =>
    isAdminNavItemActive(pathname, item)
  );

  if (matchedItem) {
    return matchedItem.label;
  }

  if (pathname.startsWith("/admin/fuel/")) {
    return "Fuel Record Details";
  }

  return "Admin Panel";
}

export function getAdminPageDescription(pathname: string): string | null {
  if (pathname === "/admin/users/create") {
    return "Provision a new staff, driver, approver, or administrator account with the correct access profile.";
  }

  const matchedItem = allAdminNavItems.find((item) =>
    isAdminNavItemActive(pathname, item)
  );

  if (matchedItem?.description) {
    return matchedItem.description;
  }

  if (pathname.startsWith("/admin/fuel/")) {
    return "Review record integrity, supporting evidence, and activity history.";
  }

  return null;
}

export function getAdminBreadcrumbs(pathname: string): string[] {
  if (pathname === "/admin/users/create") {
    return ["Admin", "User Management", "Create User"];
  }

  const breadcrumbs = ["Admin"];
  const matchedItem = allAdminNavItems.find((item) =>
    isAdminNavItemActive(pathname, item)
  );

  if (!matchedItem) {
    return breadcrumbs;
  }

  const section = adminNavigationSections.find((group) =>
    group.items.some((item) => item.href === matchedItem.href)
  );

  if (section && section.title !== "Overview") {
    breadcrumbs.push(section.title);
  }

  breadcrumbs.push(matchedItem.label);

  return breadcrumbs;
}
