import type { LucideIcon } from "lucide-react";
import {
  Download,
  AlertTriangle,
  BarChart3,
  Droplets,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  Car,
  Wrench,
  Store,
  CheckSquare,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  description?: string;
  children?: AdminNavItem[];
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
    title: "Fleet Management",
    items: [
      {
        href: "/dashboards/fleet/vehicles",
        label: "Vehicle Registry",
        icon: Car,
        exact: false,
        description: "Manage fleet assets and compliance",
      },
      {
        href: "/dashboards/fleet/maintenance",
        label: "Maintenance Requests",
        icon: Wrench,
        exact: false,
        description: "Schedule and track vehicle repairs",
      },
      {
        href: "/dashboards/fleet/rentals",
        label: "Vehicle Rentals",
        icon: FileText,
        exact: false,
        description: "Manage leased vehicles and contracts",
      },
      {
        href: "/trips",
        label: "Trip Requests",
        icon: CheckSquare,
        exact: false,
        description: "Manage, review, and approve trip requests",
      },
      {
        href: "/dashboards/fleet/vendors",
        label: "Vendors",
        icon: Store,
        exact: false,
        description: "Manage service and vehicle providers",
      },
      {
        href: "/admin/fuel",
        label: "Fuel",
        icon: Droplets,
        exact: false,
        description: "Fuel module overview and logs",
      },
      {
        href: "/dashboards/admin/reports",
        label: "Reports",
        icon: BarChart3,
        exact: false,
        description: "Overview of all analytics and reports",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        href: "/admin/users",
        label: "Users",
        icon: Users,
        exact: false,
        description: "Manage users and access control",
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

export const allAdminNavItems = adminNavigationSections.flatMap((section) =>
  section.items.flatMap((item) => [item, ...(item.children ?? [])])
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
    if (pathname.endsWith("/edit")) {
      return "Edit Fuel Record";
    }
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
    group.items.some((item) => item.href === matchedItem.href || item.children?.some((c) => c.href === matchedItem.href))
  );

  if (section && section.title !== "Overview") {
    breadcrumbs.push(section.title);
  }

  breadcrumbs.push(matchedItem.label);

  return breadcrumbs;
}
