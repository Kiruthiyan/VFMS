"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { motion } from "framer-motion";

import {
  AuthField,
  AuthInlineMessage,
  AuthInput,
  AuthStatusPanel,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { forgotPasswordApi, getErrorMessage } from "@/lib/api/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validators/auth/forgot-password-schema";

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
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setServerError(null);

    try {
      await forgotPasswordApi(data.email.trim().toLowerCase());
      setSubmittedEmail(data.email.trim().toLowerCase());
      setSubmitted(true);
    } catch (error: unknown) {
      setServerError(getErrorMessage(error));
    }
  };

  if (submitted) {
    return (
      <AuthStatusPanel
        icon={CheckCircle2}
        tone="success"
        title="Check your email"
        description={`If an account exists for ${submittedEmail}, password reset instructions have been sent.`}
      >
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setSubmittedEmail("");
            }}
          >
            Try another email
          </Button>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthStatusPanel>
    );
  }

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

      <AuthField
        htmlFor="email"
        label="Email address"
        error={errors.email?.message}
        required
      >
        <AuthInput
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          disabled={isSubmitting}
          {...register("email")}
        />
      </AuthField>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size={16} />
            Sending instructions...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Send reset link
          </>
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </motion.form>
  );
}
