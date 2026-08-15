import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FuelFlagBadgeProps {
  flagged: boolean;
  reason?: string | null;
  className?: string;
}

export function FuelFlagBadge({
  flagged,
  reason,
  className,
}: FuelFlagBadgeProps) {
  if (!flagged) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
          "whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em]",
          "border-emerald-200 bg-emerald-50 text-emerald-700",
          className
        )}
      >
        <CheckCircle2 size={11} />
        Clear
      </span>
    );
  }

  return (
    <span
      title={reason ?? "Flagged for review"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1",
        "whitespace-nowrap text-xs font-bold uppercase tracking-[0.08em]",
        "border-red-200 bg-red-50 text-red-700",
        className
      )}
    >
      <AlertTriangle size={11} />
      Flagged
    </span>
  );
}
