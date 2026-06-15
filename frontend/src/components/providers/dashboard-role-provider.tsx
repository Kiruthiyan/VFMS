"use client";

import type { ReactNode } from "react";

import { RoleProvider } from "@/lib/role-context";

export function DashboardRoleProvider({ children }: { children: ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
