"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  AuthInlineMessage,
  AuthStatusPanel,
  PasswordField,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage, resetPasswordApi } from "@/lib/api/auth";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/lib/validators/auth/reset-password-schema";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (!token) {
    return (
      <AuthStatusPanel
        icon={AlertCircle}
        tone="danger"
        title="Invalid reset link"
        description="This reset link is missing the required token. Please request a new password reset email."
      >
        <Button asChild className="w-full">
          <Link href={AUTH_ROUTES.FORGOT_PASSWORD}>Request a new reset link</Link>
        </Button>
      </AuthStatusPanel>
    );
  }

  if (success) {
    return (
      <AuthStatusPanel
        icon={CheckCircle2}
        tone="success"
        title="Password updated"
        description="Your password has been reset successfully. You can now sign in with your new credentials."
      >
        <Button className="w-full" onClick={() => router.push(AUTH_ROUTES.LOGIN)}>
          Go to sign in
        </Button>
      </AuthStatusPanel>
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
      toast.success("Password reset successfully.");
    } catch (error: unknown) {
      setServerError(getErrorMessage(error));
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <AuthInlineMessage type="error" message={serverError} />

      <div className="space-y-5">
        <PasswordField
          id="newPassword"
          label="New password"
          placeholder="Create a new password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          hint="Use at least 8 characters with uppercase, lowercase, a number, and a special character."
          disabled={isSubmitting}
          required
          {...register("newPassword")}
        />

        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          disabled={isSubmitting}
          required
          {...register("confirmPassword")}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size={16} />
            Updating password...
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Reset password
          </>
        )}
      </Button>

      <div className="text-center">
        <Link
          href={AUTH_ROUTES.LOGIN}
          className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
        >
          Back to sign in
        </Link>
      </div>
    </motion.form>
  );
}
