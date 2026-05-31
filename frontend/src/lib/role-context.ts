"use client";

import { useAuthStore } from "@/store/auth-store";

export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  return {
    role,
    canAdmin: role === "ADMIN",
    canApprove: role === "ADMIN" || role === "APPROVER",
    canCreate: role === "ADMIN" || role === "SYSTEM_USER" || role === "STAFF",
    canDrive: role === "DRIVER"
  };
}
