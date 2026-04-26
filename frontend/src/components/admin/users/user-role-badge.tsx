import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth";

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  APPROVER: "bg-[#F3F0FF] text-[#6B21A8] border-[#E9D5FF]",
  SYSTEM_USER: "bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]",
  DRIVER: "bg-[#ECFDF5] text-[#065F46] border-[#A6F4C5]",
};

export function UserRoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-lg",
        "text-xs font-semibold border",
        ROLE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
