import { cn } from "@/lib/utils";
import type { UserStatus } from "@/lib/auth";

const STATUS_STYLES: Record<UserStatus, string> = {
  EMAIL_UNVERIFIED:
    "bg-slate-800 text-slate-400 border-slate-700",
  PENDING_APPROVAL:
    "bg-amber-950/50 text-amber-400 border-amber-800/50",
  APPROVED:
    "bg-green-950/50 text-green-400 border-green-800/50",
  REJECTED:
    "bg-red-950/50 text-red-400 border-red-800/50",
  DEACTIVATED:
    "bg-slate-800 text-slate-500 border-slate-700",
};

const STATUS_LABELS: Record<UserStatus, string> = {
  EMAIL_UNVERIFIED: "Unverified",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  DEACTIVATED: "Deactivated",
};

export function UserStatusBadge({
  status,
  className,
}: {
  status: UserStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full",
        "text-xs font-semibold border",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
