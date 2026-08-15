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
      ? "bg-red-50"
      : alertType === "success"
        ? "bg-emerald-50"
        : alertType === "warning"
          ? "bg-amber-50"
          : "bg-blue-50";

  const borderColor =
    alertType === "error"
      ? "border-red-200"
      : alertType === "success"
        ? "border-emerald-200"
        : alertType === "warning"
          ? "border-amber-200"
          : "border-blue-200";

  const textColor =
    alertType === "error"
      ? "text-red-700"
      : alertType === "success"
        ? "text-emerald-700"
        : alertType === "warning"
          ? "text-amber-800"
          : "text-blue-700";

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
    <div className={`${bgColor} ${borderColor} border rounded-xl p-4 shadow-xs`}>
      <div className="flex gap-3">
        <Icon size={18} className={`${textColor} mt-0.5 flex-shrink-0`} />
        <div className="min-w-0 flex-1">
          {title && <p className={`${textColor} font-semibold mb-1`}>{title}</p>}
          <p className={`${textColor} text-sm leading-6 break-words`}>{message || children}</p>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className={`${textColor} flex-shrink-0 rounded-md p-1 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
