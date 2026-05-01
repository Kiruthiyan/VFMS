import { AlertCircle, CheckCircle2, Info } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormMessageProps {
  type: "error" | "success" | "info";
  message: string;
  className?: string;
  title?: string;
}

const styles = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-600",
    text: "text-red-700",
    title: "text-red-900",
    defaultTitle: "Please review the highlighted information",
    Icon: AlertCircle,
  },
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    text: "text-emerald-700",
    title: "text-emerald-900",
    defaultTitle: "Success",
    Icon: CheckCircle2,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    text: "text-blue-700",
    title: "text-blue-900",
    defaultTitle: "Information",
    Icon: Info,
  },
} as const;

export function FormMessage({
  type,
  message,
  className,
  title,
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
      <div className="space-y-1">
        <p className={cn("text-sm font-semibold", style.title)}>
          {title ?? style.defaultTitle}
        </p>
        <p className={cn("text-sm leading-6", style.text)}>{message}</p>
      </div>
    </div>
  );
}
