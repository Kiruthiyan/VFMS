import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type MessageType = "error" | "success" | "info";

interface FormMessageProps {
  type: MessageType;
  message: string;
  className?: string;
}

const styles: Record<MessageType, { wrapper: string; icon: React.ComponentType<{ className?: string }> }> = {
  error: {
    wrapper: "bg-red-950/50 text-red-300 border border-red-800/60",
    icon: AlertCircle,
  },
  success: {
    wrapper: "bg-green-950/50 text-green-300 border border-green-800/60",
    icon: CheckCircle2,
  },
  info: {
    wrapper: "bg-blue-950/50 text-blue-300 border border-blue-800/60",
    icon: Info,
  },
};

export function FormMessage({ type, message, className }: FormMessageProps) {
  const { wrapper, icon: Icon } = styles[type];
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-4 py-3 text-sm",
        wrapper,
        className
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
