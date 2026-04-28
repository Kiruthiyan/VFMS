import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Droplets,
  FileClock,
  FileText,
  Flag,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  Users,
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
        href: "/admin/users/pending",
        label: "Pending Users",
        icon: FileClock,
        exact: true,
        description: "Review registrations waiting for approval",
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
