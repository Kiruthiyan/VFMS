import { AlertTriangle } from "lucide-react";
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
  if (!flagged) return null;

  return (
    <span
      title={reason ?? "Flagged for review"}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "text-xs font-semibold border",
        "bg-red-950/50 text-red-400 border-red-800/50",
        className
      )}
    >
      <AlertTriangle size={10} />
      Flagged
    </span>
  );
}
