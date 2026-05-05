"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { motion } from "framer-motion";

import {
  AuthField,
  AuthFormLinks,
  AuthInlineMessage,
  AuthInput,
  AuthStatusPanel,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { forgotPasswordApi, getErrorMessage } from "@/lib/api/auth";
import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/lib/constants/routes";
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
        <div className="space-y-2.5">
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
          <AuthFormLinks
            prompt="Remembered your password?"
            actionLabel="Sign in"
            actionHref={AUTH_ROUTES.LOGIN}
            homeHref={PUBLIC_ROUTES.HOME}
          />
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
      className="space-y-4"
      noValidate
    >
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-center py-1"
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_28%,rgba(253,224,71,0.98),rgba(252,211,77,0.88)_38%,rgba(251,191,36,0.62)_62%,rgba(217,119,6,0.22)_100%)] shadow-[0_22px_34px_-18px_rgba(251,191,36,0.95)]"
        >
          <span className="absolute inset-[4px] rounded-full border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(255,255,255,0.03))]" />
          <span className="absolute top-3 h-4 w-9 rounded-full bg-white/28 blur-[1px]" />
          <span className="absolute inset-x-4 bottom-3 h-3 rounded-full bg-amber-950/10 blur-md" />
          <LockKeyhole className="relative z-10 h-11 w-11 text-amber-950 drop-shadow-[0_5px_10px_rgba(120,53,15,0.28)]" strokeWidth={2.2} />
        </motion.div>
      </motion.div>

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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
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

      <AuthFormLinks
        prompt="Remembered your password?"
        actionLabel="Sign in"
        actionHref={AUTH_ROUTES.LOGIN}
        homeHref={PUBLIC_ROUTES.HOME}
      />
    </motion.form>
  );
}
