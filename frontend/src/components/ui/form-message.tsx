<<<<<<< HEAD
<<<<<<< HEAD
import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";
=======
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
>>>>>>> origin/feature/user-auth

interface FormMessageProps {
  type: "error" | "success" | "info";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
<<<<<<< HEAD
  const bgColor =
    type === "error"
      ? "bg-red-500/10"
      : type === "success"
        ? "bg-green-500/10"
        : "bg-blue-500/10";

  const borderColor =
    type === "error"
      ? "border-red-500/20"
      : type === "success"
        ? "border-green-500/20"
        : "border-blue-500/20";

  const textColor =
    type === "error"
      ? "text-red-400"
      : type === "success"
        ? "text-green-400"
        : "text-blue-400";

  const Icon =
    type === "error"
      ? AlertCircle
      : type === "success"
        ? CheckCircle
        : InfoIcon;

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 flex gap-3`}>
      <Icon size={18} className={textColor} />
      <p className={`${textColor} text-sm`}>{message}</p>
=======
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
  };

  const style = styles[type];
  const Icon = style.Icon;

  return (
    <div className={`rounded-xl ${style.bg} border ${style.border} p-4 flex items-start gap-3`}>
      <Icon size={18} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
      <p className={`text-sm ${style.text}`}>{message}</p>
>>>>>>> origin/feature/user-auth
=======
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
>>>>>>> origin/feature/user-management
    </div>
  );
}
