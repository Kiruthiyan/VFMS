import type { UserRole } from "@/lib/auth";

export const ROLE_GUIDANCE: Record<
  UserRole,
  { title: string; description: string }
> = {
  ADMIN: {
    title: "Administrator access",
    description:
      "Use this role for trusted platform administrators who manage users, approvals, and system-wide operations.",
  },
  APPROVER: {
    title: "Approver access",
    description:
      "Use this role for staff who review and authorize operational actions. Approval level can be added if your workflow uses approval tiers.",
  },
  SYSTEM_USER: {
    title: "Staff account",
    description:
      "Use this role for company staff who need day-to-day access. Employee ID, department, designation, and office location are required.",
  },
  DRIVER: {
    title: "Driver account",
    description:
      "Use this role only for verified drivers. Licence number and licence expiry date are required before the account is created.",
  },
};
