import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface FormMessageProps {
  type: "error" | "success" | "info";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
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
    </div>
  );
}
