"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ArrowLeft, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators/auth/forgot-password-schema";
import { forgotPasswordApi, getErrorMessage } from "@/lib/api/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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

  // Success State
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="text-center py-8"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle2 className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Check Your Email</h2>
        <p className="text-slate-600 text-sm font-medium mb-4">
          If an account exists for <span className="font-semibold text-slate-900">{submittedEmail}</span>, we&apos;ve sent a reset link.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSubmittedEmail("");
          }}
          className="text-amber-600 hover:text-amber-700 text-sm font-medium transition-colors mb-4"
        >
          Didn&apos;t receive it? Try again
        </button>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      <div className="flex justify-center mb-6">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center"
        >
          <Lock className="w-6 h-6 text-white" strokeWidth={1.5} />
        </motion.div>
      </div>

      {/* Error Alert */}
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

      {/* Email Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
        className="space-y-2.5"
      >
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          autoFocus
          {...register("email")}
          disabled={isSubmitting}
          className="w-full px-4 py-3.5 text-sm rounded-xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm transition-all duration-300
                     focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 focus:bg-white focus:shadow-lg focus:shadow-amber-500/15
                     hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                     disabled:opacity-50 placeholder:text-slate-400"
        />
        <AnimatePresence>
          {errors.email && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
            >
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{errors.email.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
        type="submit"
        disabled={isSubmitting}
        className="relative w-full h-12 mt-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group disabled:opacity-70 flex items-center justify-center gap-2"
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
            "Send Reset Link"
          )}
        </span>
      </motion.button>

      {/* Back to Sign In */}
      <p className="text-center text-xs text-slate-600 pt-1">
        <Link
          href="/auth/login"
          className="font-medium text-slate-900 hover:text-amber-600 transition-colors flex items-center justify-center gap-1"
        >
          <ArrowLeft size={14} />
          Back to Sign In
        </Link>
      </p>
    </motion.form>
  );
}