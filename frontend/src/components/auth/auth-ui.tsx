"use client";

import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";

import { FormMessage } from "@/components/ui/form-message";
import { cn } from "@/lib/utils";

export const authInputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60";

export const authSelectClassName = cn(
  authInputClassName,
  "appearance-none pr-10 text-left"
);

interface AuthSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function AuthSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: AuthSectionHeaderProps) {
  return (
    <div className={cn("space-y-2", align === "center" && "text-center")}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="text-sm leading-7 text-slate-500">{description}</p>
      ) : null}
    </div>
  );
}

interface AuthFieldProps {
  htmlFor: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function AuthField({
  htmlFor,
  label,
  error,
  hint,
  required,
  children,
}: AuthFieldProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-slate-700"
      >
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

export const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(authInputClassName, className)} {...props} />
));
AuthInput.displayName = "AuthInput";

export const AuthSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(authSelectClassName, className)}
    {...props}
  >
    {children}
  </select>
));
AuthSelect.displayName = "AuthSelect";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      id,
      label,
      error,
      hint,
      required,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(false);

    return (
      <AuthField
        htmlFor={id}
        label={label}
        error={error}
        hint={hint}
        required={required}
      >
        <div className="relative">
          <AuthInput
            ref={ref}
            id={id}
            type={visible ? "text" : "password"}
            className={cn("pr-12", className)}
            disabled={disabled}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={visible ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </AuthField>
    );
  }
);
PasswordField.displayName = "PasswordField";

interface AuthInlineMessageProps {
  type: "error" | "success" | "info";
  message: string | null;
  className?: string;
}

export function AuthInlineMessage({
  type,
  message,
  className,
}: AuthInlineMessageProps) {
  if (!message) {
    return null;
  }

  return <FormMessage type={type} message={message} className={className} />;
}

interface AuthStatusPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tone?: "neutral" | "success" | "warning" | "danger";
  children?: React.ReactNode;
}

const statusStyles = {
  neutral: {
    panel: "border-slate-200 bg-slate-50",
    icon: "bg-slate-900 text-amber-400",
  },
  success: {
    panel: "border-emerald-200 bg-emerald-50",
    icon: "bg-emerald-600 text-white",
  },
  warning: {
    panel: "border-amber-200 bg-amber-50",
    icon: "bg-amber-400 text-slate-950",
  },
  danger: {
    panel: "border-red-200 bg-red-50",
    icon: "bg-red-600 text-white",
  },
} as const;

export function AuthStatusPanel({
  icon: Icon,
  title,
  description,
  tone = "neutral",
  children,
}: AuthStatusPanelProps) {
  const styles = statusStyles[tone];

  return (
    <div className={cn("rounded-3xl border p-6", styles.panel)}>
      <div className="flex flex-col items-center gap-4 text-center">
        <span
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm",
            styles.icon
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">
            {title}
          </h2>
          <p className="text-sm leading-7 text-slate-600">{description}</p>
        </div>
        {children ? <div className="w-full pt-2">{children}</div> : null}
      </div>
    </div>
  );
}

interface AuthStepIndicatorProps {
  steps: Array<{ number: number; title: string }>;
  currentStep: number;
}

export function AuthStepIndicator({
  steps,
  currentStep,
}: AuthStepIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-300"
          style={{ width: `${(currentStep / steps.length) * 100}%` }}
        />
      </div>
      <div className="grid grid-cols-5 gap-2">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isComplete = step.number < currentStep;

          return (
            <div key={step.number} className="space-y-2">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border text-xs font-bold transition-all",
                  isActive &&
                    "border-amber-300 bg-amber-100 text-amber-900 shadow-sm",
                  isComplete &&
                    "border-emerald-200 bg-emerald-100 text-emerald-700",
                  !isActive &&
                    !isComplete &&
                    "border-slate-200 bg-white text-slate-400"
                )}
              >
                {step.number}
              </div>
              <p
                className={cn(
                  "line-clamp-2 text-[11px] font-semibold leading-4",
                  isActive
                    ? "text-slate-900"
                    : isComplete
                      ? "text-emerald-700"
                      : "text-slate-400"
                )}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
