import { AlertTriangle, CheckCircle, InfoIcon, AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface AlertProps {
  variant?: "error" | "success" | "info" | "warning";
  type?: "error" | "success" | "info" | "warning";
  title?: string;
  message?: string;
  children?: React.ReactNode;
  dismissible?: boolean;
}

export function Alert({
  variant,
  type,
  title,
  message,
  children,
  dismissible = false,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  const alertType = variant || type || "info";

  const bgColor =
    alertType === "error"
      ? "bg-red-500/10"
      : alertType === "success"
        ? "bg-green-500/10"
        : alertType === "warning"
          ? "bg-amber-500/10"
          : "bg-blue-500/10";

  const borderColor =
    alertType === "error"
      ? "border-red-500/20"
      : alertType === "success"
        ? "border-green-500/20"
        : alertType === "warning"
          ? "border-amber-500/20"
          : "border-blue-500/20";

  const textColor =
    alertType === "error"
      ? "text-red-400"
      : alertType === "success"
        ? "text-green-400"
        : alertType === "warning"
          ? "text-amber-400"
          : "text-blue-400";

  const Icon =
    alertType === "error"
      ? AlertCircle
      : alertType === "success"
        ? CheckCircle
        : alertType === "warning"
          ? AlertTriangle
          : InfoIcon;

  if (dismissed) return null;

  return (
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4`}>
      <div className="flex gap-3">
        <Icon size={18} className={`${textColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          {title && <p className={`${textColor} font-semibold mb-1`}>{title}</p>}
          <p className={`${textColor} text-sm`}>{message || children}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className={`${textColor} hover:opacity-80 flex-shrink-0`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
