"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators/auth/forgot-password-schema";
import { forgotPasswordApi, getErrorMessage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 " +
  "focus:border-amber-500/60 disabled:opacity-50 transition-colors";

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);
    try {
      await forgotPasswordApi(data.email);
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  // ── SUCCESS STATE ─────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-amber-950/40 border border-amber-800/40 flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7 text-amber-400" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            Check your email
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            If an account exists for{" "}
            <span className="text-amber-400 font-medium">
              {submittedEmail}
            </span>
            , we have sent a password reset link. The link expires in{" "}
            <span className="text-slate-300 font-medium">1 hour</span>.
          </p>
        </div>

        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Didn&apos;t receive it? Check your spam folder, or{" "}
            <button
              onClick={() => {
                setSubmitted(false);
                setSubmittedEmail("");
              }}
              className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
            >
              try again
            </button>
            .
          </p>
        </div>

        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <FormMessage type="error" message={serverError} />
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-slate-300">
          Email Address <span className="text-amber-500">*</span>
        </label>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          disabled={isSubmitting}
          className={inputClass}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
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
        {isSubmitting ? "Sending..." : "Send Reset Link"}
      </Button>

      <Link
        href="/auth/login"
        className="flex items-center justify-center gap-2 text-sm
                   text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Sign In
      </Link>
    </form>
  );
}
