import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormMessageProps {
  type: "error" | "success" | "info";
  message: string;
  className?: string;
}

const styles = {
  error: {
    bg: "bg-red-950/40",
    border: "border-red-800/40",
    icon: "text-red-400",
    text: "text-red-300",
    Icon: AlertCircle,
  },
  success: {
    bg: "bg-green-950/40",
    border: "border-green-800/40",
    icon: "text-green-400",
    text: "text-green-300",
    Icon: CheckCircle2,
  },
  info: {
    bg: "bg-blue-950/40",
    border: "border-blue-800/40",
    icon: "text-blue-400",
    text: "text-blue-300",
    Icon: Info,
  },
} as const;

export function FormMessage({
  type,
  message,
  className,
}: FormMessageProps) {
  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        style.bg,
        style.border,
        className
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", style.icon)} />
      <p className={cn("text-sm", style.text)}>{message}</p>
    </div>
  );
}
