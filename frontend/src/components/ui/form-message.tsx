import { AlertCircle, CheckCircle, InfoIcon } from "lucide-react";

interface FormMessageProps {
  type: "error" | "success" | "info";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
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
    </div>
  );
}
