import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormMessageProps {
  type: "error" | "success";
  message: string;
  className?: string;
}

export function FormMessage({ type, message, className }: FormMessageProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
        type === "error"
          ? "bg-red-50 text-red-700 border border-red-200"
          : "bg-green-50 text-green-700 border border-green-200",
        className
      )}
    >
      {type === "error" ? (
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
      ) : (
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
}