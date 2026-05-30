// Shared authentication types and route helpers used across frontend modules.

export type UserRole = "ADMIN" | "APPROVER" | "SYSTEM_USER" | "DRIVER";

export type UserStatus =
  | "EMAIL_UNVERIFIED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "DEACTIVATED";

export interface AuthUser {
  userId?: string;
  email: string;
  fullName: string;
  role: UserRole;
  status?: UserStatus;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Administrator",
  APPROVER: "Approver",
  SYSTEM_USER: "Staff / System User",
  DRIVER: "Driver",
};

// Keeps admin-managed role options centralized so create/edit dialogs stay aligned.
export const ADMIN_MANAGED_ROLE_OPTIONS: UserRole[] = [
  "ADMIN",
  "APPROVER",
  "SYSTEM_USER",
  "DRIVER",
];

/** @deprecated Use ROLE_HOME from @/lib/rbac */
export { ROLE_HOME as ROLE_REDIRECTS } from "@/lib/rbac";
