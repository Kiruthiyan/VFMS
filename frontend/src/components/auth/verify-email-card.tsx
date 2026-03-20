"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from "@/lib/validators/auth/resend-verification-schema";
import { resendVerificationApi, getErrorMessage } from "@/lib/api/auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

// ── TYPES ─────────────────────────────────────────────────────────────────

type VerifyState = "loading" | "success" | "expired" | "invalid" | "no_token";

interface ApiSuccessResponse {
  success: boolean;
  message: string;
  data: null;
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 " +
  "disabled:opacity-50 transition-colors";

// ── RESEND FORM ────────────────────────────────────────────────────────────

function ResendForm({ prefillEmail }: { prefillEmail?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: { email: prefillEmail ?? "" },
  });

  const onSubmit = async (data: ResendVerificationFormValues) => {
    setServerError(null);
    try {
      await resendVerificationApi(data.email);
      setSubmitted(true);
      toast.success("Verification email sent!");
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  if (submitted) {
    return (
      <div className="mt-6 rounded-xl bg-green-950/40 border border-green-800/40 p-4 text-center">
        <Mail className="w-8 h-8 text-green-400 mx-auto mb-2" />
        <p className="text-sm text-green-300 font-medium">
          Verification email sent!
        </p>
        <p className="text-xs text-green-500 mt-1">
          Please check your inbox and click the new link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3">
      <p className="text-sm text-slate-400">
        Enter your email to receive a new verification link:
      </p>

      {serverError && (
        <FormMessage type="error" message={serverError} />
      )}

      <div className="space-y-1.5">
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
        className="w-full h-11 rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-400
                   font-bold text-sm flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {isSubmitting && <LoadingSpinner size={14} />}
        {isSubmitting ? "Sending..." : "Resend Verification Email"}
      </Button>
    </form>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "no_token"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await api.post<ApiSuccessResponse>(
          `/api/auth/verify-email?token=${token}`
        );
        setState("success");
      } catch (err) {
        const message = getErrorMessage(err);

        if (
          message.toLowerCase().includes("expired") ||
          message.toLowerCase().includes("expire")
        ) {
          setState("expired");
          setErrorMessage(message);
        } else {
          setState("invalid");
          setErrorMessage(message);
        }
      }
    };

    verifyToken();
  }, [token]);

  // ── LOADING ──────────────────────────────────────────────────────────────

  if (state === "loading") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">
          Verifying your email
        </h2>
        <p className="text-sm text-slate-500">
          Please wait a moment...
        </p>
      </div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────

  if (state === "success") {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-950/60 border border-green-800/50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">
            Email verified!
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your email has been verified successfully.
          </p>
        </div>

        <div className="rounded-xl bg-amber-950/30 border border-amber-800/30 p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300 text-left leading-relaxed">
              Your account is now{" "}
              <strong>pending admin approval</strong>. You will receive
              an email notification once your account has been reviewed.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Already approved?{" "}
          <Link
            href="/auth/login"
            className="text-amber-400 hover:text-amber-300 font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // ── EXPIRED ───────────────────────────────────────────────────────────────

  if (state === "expired") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-950/60 border border-orange-800/50 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              Link expired
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This verification link has expired.
              Verification links are valid for{" "}
              <span className="text-slate-300 font-medium">24 hours</span>.
            </p>
          </div>
        </div>

        <ResendForm />

        <p className="text-center text-xs text-slate-600 pt-2">
          <Link
            href="/auth/login"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  // ── INVALID ───────────────────────────────────────────────────────────────

  if (state === "invalid") {
    return (
      <div className="space-y-4">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100 mb-1">
              Invalid link
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              This verification link is invalid or has already been used.
            </p>
          </div>
        </div>

        <ResendForm />

        <p className="text-center text-xs text-slate-600 pt-2">
          <Link
            href="/auth/login"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Back to Sign In
          </Link>
        </p>
      </div>
    );
  }

  // ── NO TOKEN ──────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8 text-slate-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-1">
            Verify your email
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            No verification token found. Please use the link sent to your
            email, or request a new one below.
          </p>
        </div>
      </div>

      <ResendForm />

      <p className="text-center text-xs text-slate-600 pt-2">
        <Link
          href="/auth/login"
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          Back to Sign In
        </Link>
      </p>
    </div>
  );
}
