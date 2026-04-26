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
import { changePasswordApi, getErrorMessage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 " +
  "text-sm text-blue-900 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-yellow-500/50 " +
  "focus:border-yellow-500 disabled:opacity-50 transition-colors";

export function ChangePasswordForm() {
  const router = useRouter();
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
      // Redirect to their own dashboard after short delay
      setTimeout(() => router.back(), 1500);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="max-w-md">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#0B1736] border border-[#0B1736] flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-[#F4B400]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-blue-900">
            Change Password
          </h2>
          <p className="text-xs text-slate-500">
            Update your account password
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-300 rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-blue-900">
              Current Password <span className="text-yellow-600">*</span>
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
          <div className="border-t border-slate-300" />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-blue-900">
              New Password <span className="text-yellow-600">*</span>
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
            <label className="block text-sm font-medium text-blue-900">
              Confirm New Password <span className="text-yellow-600">*</span>
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
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl border border-slate-300 
                         bg-white text-blue-900 hover:bg-slate-50 
                         font-medium text-sm transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-[#F4B400] text-white
                         hover:bg-yellow-400 font-bold text-sm flex items-center
                         justify-center gap-2 disabled:opacity-60
                         disabled:cursor-not-allowed transition-colors"
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
