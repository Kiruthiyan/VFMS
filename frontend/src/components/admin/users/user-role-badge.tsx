import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth";

const ROLE_STYLES: Record<UserRole, string> = {
  ADMIN: "bg-red-950/40 text-red-400 border-red-800/40",
  APPROVER: "bg-purple-950/40 text-purple-400 border-purple-800/40",
  SYSTEM_USER: "bg-blue-950/40 text-blue-400 border-blue-800/40",
  DRIVER: "bg-green-950/40 text-green-400 border-green-800/40",
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
        "inline-flex items-center px-2.5 py-0.5 rounded-full",
        "text-xs font-semibold border",
        ROLE_STYLES[role],
        className
      )}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
