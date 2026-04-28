"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/lib/validators/auth/change-password-schema";
import { DEFAULT_ROUTES, ROLE_DASHBOARDS } from "@/lib/constants/routes";
import { changePasswordApi, getErrorMessage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { useAuthStore } from "@/store/auth-store";

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 " +
  "text-sm text-slate-900 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-400 " +
  "focus:border-amber-400 disabled:opacity-50 transition-colors";

export function ChangePasswordForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      await changePasswordApi(data);
      toast.success("Password changed successfully!");
      reset();
      const destination = user
        ? ROLE_DASHBOARDS[user.role]
        : DEFAULT_ROUTES.DEFAULT_DASHBOARD;
      setTimeout(() => router.replace(destination), 1500);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  const cancelDestination = user
    ? ROLE_DASHBOARDS[user.role]
    : DEFAULT_ROUTES.DEFAULT_DASHBOARD;

  return (
    <div className="max-w-xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950">
            <ShieldCheck className="h-5 w-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              Update credentials
            </h2>
            <p className="text-sm text-slate-500">
              Enter your current password and set a new one.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-900">
              Current Password <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter current password"
                {...register("currentPassword")}
                disabled={isSubmitting}
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-200" />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-900">
              New Password <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Min. 8 characters"
                {...register("newPassword")}
                disabled={isSubmitting}
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-900">
              Confirm New Password <span className="text-amber-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Re-enter new password"
                {...register("confirmPassword")}
                disabled={isSubmitting}
                className={inputClass + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={() => router.replace(cancelDestination)}
              disabled={isSubmitting}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting && <LoadingSpinner size={14} />}
              {isSubmitting ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
