import { cn } from "@/lib/utils";
import type { UserStatus } from "@/lib/auth";

const STATUS_STYLES: Record<UserStatus, string> = {
  EMAIL_UNVERIFIED:
    "bg-[#F9FAFC] text-[#667085] border-[#E4E7EC]",
  PENDING_APPROVAL:
    "bg-[#FFF3CD] text-[#8D6000] border-[#FFE9A3]",
  APPROVED:
    "bg-[#ECFDF5] text-[#065F46] border-[#A6F4C5]",
  REJECTED:
    "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]",
  DEACTIVATED:
    "bg-[#F9FAFC] text-[#667085] border-[#E4E7EC]",
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
  enabled = true,
  className,
}: {
  status: UserStatus;
  enabled?: boolean;
  className?: string;
}) {
  // APPROVED/DEACTIVATED are collapsed into a single Active/Deactivated
  // state so the row shows one clear badge instead of a status badge plus
  // a separate "disabled" indicator. Other lifecycle statuses (Pending,
  // Rejected, Unverified) are unaffected by the enabled flag and keep
  // their own label.
  const effectiveStatus: UserStatus =
    status === "APPROVED" && !enabled ? "DEACTIVATED" : status;
  const label = effectiveStatus === "APPROVED" ? "Active" : STATUS_LABELS[effectiveStatus];

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-lg",
        "text-xs font-semibold border",
        STATUS_STYLES[effectiveStatus],
        className
      )}
    >
      {label}
    </span>
  );
}
