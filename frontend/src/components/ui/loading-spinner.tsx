import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export function LoadingSpinner({ size = 16, className }: LoadingSpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn("animate-spin", className)}
      aria-label="Loading"
    />
  );
}
