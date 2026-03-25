"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validators/auth/reset-password-schema";
import { resetPasswordApi, getErrorMessage } from "@/lib/api/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

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
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center mx-auto"
        >
          <AlertCircle className="w-8 h-8 text-red-700" strokeWidth={1.5} />
        </motion.div>
        <div>
          <p className="text-slate-900 font-bold text-lg mb-1">Invalid Reset Link</p>
          <p className="text-sm text-slate-600">No reset token found. Please request a new reset link.</p>
        </div>
        <Link
          href="/auth/forgot-password"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
        >
          Request New Link
        </Link>
      </motion.div>
    );
  }

  // Success state
  if (success) {
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
        <h2 className="text-2xl font-black text-slate-900 mb-2">Password Reset!</h2>
        <p className="text-slate-600 text-sm font-medium mb-6">Your password has been updated successfully.</p>
        <motion.button
          onClick={() => router.push("/auth/login")}
          className="relative w-full h-12 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl font-semibold overflow-hidden group flex items-center justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 blur-xl"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          <span className="relative">Go to Sign In</span>
        </motion.button>
      </motion.div>
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
    <motion.form 
      onSubmit={handleSubmit(onSubmit)} 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-5"
    >
      {/* Server Error */}
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

      {/* New Password Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 100, damping: 20 }}
        className="space-y-2.5"
      >
        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700">
          New Password
        </label>
        <div className="relative">
          <input
            id="newPassword"
            type={showNew ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Min. 8 characters with uppercase & number"
            {...register("newPassword")}
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl border border-slate-200 
                       bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm 
                       transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 
                       focus:border-amber-400 focus:bg-white focus:shadow-lg 
                       focus:shadow-amber-500/15
                       hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                       disabled:opacity-50"
          />
          <motion.button
            type="button"
            onClick={() => setShowNew(!showNew)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-amber-600 transition-colors duration-200"
            disabled={isSubmitting}
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        </div>
        <AnimatePresence>
          {errors.newPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
            >
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{errors.newPassword.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Password Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100, damping: 20 }}
        className="space-y-2.5"
      >
        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            {...register("confirmPassword")}
            disabled={isSubmitting}
            className="w-full px-4 py-3.5 pr-11 text-sm rounded-xl border border-slate-200 
                       bg-gradient-to-br from-white via-slate-50 to-white backdrop-blur-sm 
                       transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-amber-500/40 
                       focus:border-amber-400 focus:bg-white focus:shadow-lg 
                       focus:shadow-amber-500/15
                       hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5
                       disabled:opacity-50"
          />
          <motion.button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-500 hover:text-amber-600 transition-colors duration-200"
            disabled={isSubmitting}
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </motion.button>
        </div>
        <AnimatePresence>
          {errors.confirmPassword && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200"
            >
              <AlertCircle size={14} className="text-red-600 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-red-700">{errors.confirmPassword.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 100, damping: 20 }}
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
              Resetting...
            </>
          ) : (
            "Reset Password"
          )}
        </span>
      </motion.button>

      {/* Back to Login */}
      <p className="text-center text-xs text-slate-600 pt-1">
        <Link
          href="/auth/login"
          className="font-medium text-slate-900 hover:text-amber-600 transition-colors"
        >
          Back to Sign In
        </Link>
      </p>
    </motion.form>
  );
}