"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from "@/lib/validators/auth/resend-verification-schema";
import { resendVerificationApi, getErrorMessage } from "@/lib/api/auth";
import api from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// ── TYPES ─────────────────────────────────────────────────────────────────

type VerifyState = "loading" | "success" | "expired" | "invalid" | "no_token";

interface ApiSuccessResponse {
  success: boolean;
  message: string;
  data: null;
}

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center mx-auto mb-2"
        >
          <Mail className="w-4 h-4 text-white" strokeWidth={2} />
        </motion.div>
        <p className="text-sm text-emerald-700 font-semibold">
          Verification email sent!
        </p>
        <p className="text-xs text-emerald-600 mt-1">
          Please check your inbox and click the new link.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit(onSubmit)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 space-y-4"
    >
      <p className="text-sm text-slate-600 font-medium">
        Enter your email to receive a new verification link:
      </p>

      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
            <p className="font-medium text-red-700 text-sm">{serverError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        {...register("email")}
        disabled={isSubmitting}
        className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 
                   bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm 
                   transition-all duration-300
                   focus:outline-none focus:ring-2 focus:ring-amber-500/40 
                   focus:border-amber-400 focus:bg-white focus:shadow-lg 
                   focus:shadow-amber-500/15
                   hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                   disabled:opacity-50"
      />
      {errors.email && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
        >
          <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-xs font-medium text-red-700">{errors.email.message}</p>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />
        <span className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <LoadingSpinner size={16} />
              Sending...
            </>
          ) : (
            "Resend Verification Email"
          )}
        </span>
      </motion.button>
    </motion.form>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto"
        >
          <Mail className="w-6 h-6 text-white" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Verifying Email</h2>
          <p className="text-sm text-slate-600 mt-1">Please wait a moment...</p>
        </div>
      </motion.div>
    );
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Email Verified!
          </h2>
          <p className="text-sm text-slate-600">
            Your email has been verified successfully.
          </p>
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 text-left font-medium">
              Your account is now <span className="font-black">pending admin approval</span>. You will be notified by email once approved.
            </p>
          </div>
        </div>

        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
        >
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  // ── EXPIRED ───────────────────────────────────────────────────────────────

  if (state === "expired") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mx-auto"
          >
            <Clock className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Link Expired
            </h2>
            <p className="text-sm text-slate-600">
              This verification link has expired. Verification links are valid for <span className="font-semibold text-slate-900">24 hours</span>.
            </p>
          </div>
        </div>

        <ResendForm />

        <p className="text-center text-xs text-slate-600 pt-2">
          <Link
            href="/auth/login"
            className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
          >
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    );
  }

  // ── INVALID ───────────────────────────────────────────────────────────────

  if (state === "invalid") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="text-center space-y-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center mx-auto"
          >
            <AlertCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
          </motion.div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">
              Invalid Link
            </h2>
            <p className="text-sm text-slate-600">
              This verification link is invalid or has already been used.
            </p>
          </div>
        </div>

        <ResendForm />

        <p className="text-center text-xs text-slate-600 pt-2">
          <Link
            href="/auth/login"
            className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
          >
            Back to Sign In
          </Link>
        </p>
      </motion.div>
    );
  }

  // ── NO TOKEN ──────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      <div className="text-center space-y-4">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mx-auto"
        >
          <Mail className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            Verify Your Email
          </h2>
          <p className="text-sm text-slate-600">
            No verification token found. Please use the link sent to your email, or request a new one below.
          </p>
        </div>
      </div>

      <ResendForm />

      <p className="text-center text-xs text-slate-600 pt-2">
        <Link
          href="/auth/login"
          className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
        >
          Back to Sign In
        </Link>
      </p>
    </motion.div>
  );
}