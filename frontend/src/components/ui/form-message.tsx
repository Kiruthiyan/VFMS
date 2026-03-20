import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = "error" | "success" | "info";

interface FormMessageProps {
  type: MessageType;
  message: string;
  className?: string;
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  const styles: Record<MessageType, { bg: string; border: string; text: string; icon: typeof AlertCircle }> = {
    error: {
      bg: "bg-red-950/40",
      border: "border-red-800/40",
      text: "text-red-400",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-green-950/40",
      border: "border-green-800/40",
      text: "text-green-400",
      icon: CheckCircle2,
    },
    info: {
      bg: "bg-blue-950/40",
      border: "border-blue-800/40",
      text: "text-blue-400",
      icon: Info,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "rounded-md border p-3 flex items-start gap-3",
        style.bg,
        style.border,
        className
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", style.text)} />
      <p className={cn("text-sm", style.text)}>{message}</p>
    </div>
  );
}
