import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormMessageProps {
  type: "success" | "error";
  message: string;
  className?: string;
}

export function FormMessage({
  type,
  message,
  className,
}: FormMessageProps) {
  const isError = type === "error";

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg text-sm",
        isError
          ? "bg-red-950/40 border border-red-800/40 text-red-400"
          : "bg-green-950/40 border border-green-800/40 text-green-400",
        className
      )}
    >
      {isError ? (
        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
      )}
      <p>{message}</p>
    </div>
  );
}
