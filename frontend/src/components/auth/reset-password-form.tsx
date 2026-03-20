"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validators/auth/reset-password-schema";
import { resetPasswordApi, getErrorMessage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 " +
  "focus:border-amber-500/60 disabled:opacity-50 transition-colors";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // No token in URL
  if (!token) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center mx-auto">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-slate-300 font-medium">Invalid reset link</p>
        <p className="text-sm text-slate-500">
          No reset token found. Please request a new reset link.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block text-sm text-amber-400 hover:text-amber-300 font-medium"
        >
          Request new link →
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-green-950/60 border border-green-800/50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <p className="text-slate-100 font-bold text-lg mb-1">
            Password reset!
          </p>
          <p className="text-sm text-slate-400">
            Your password has been updated. You can now sign in.
          </p>
        </div>
        <Button
          onClick={() => router.push("/auth/login")}
          className="w-full h-11 rounded-xl bg-amber-500 text-slate-900
                     hover:bg-amber-400 font-bold text-sm"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setServerError(null);
    try {
      await resetPasswordApi({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <FormMessage type="error" message={serverError} />
      )}

      {/* New Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          New Password <span className="text-amber-500">*</span>
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
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.newPassword && (
          <p className="text-xs text-red-400">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      {/* Confirm Password */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Confirm New Password <span className="text-amber-500">*</span>
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
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-xs text-red-400">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-amber-500 text-slate-900
                   hover:bg-amber-400 font-bold text-sm flex items-center
                   justify-center gap-2 disabled:opacity-60
                   disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting && <LoadingSpinner size={14} />}
        {isSubmitting ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );
}
