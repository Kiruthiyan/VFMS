"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  AuthField,
  AuthInlineMessage,
  AuthInput,
  AuthSectionHeader,
  AuthStatusPanel,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import api from "@/lib/api";
import {
  getErrorMessage,
  resendVerificationApi,
  type ApiSuccessResponse,
} from "@/lib/api/auth";
import { AUTH_ROUTES } from "@/lib/constants/routes";
import {
  resendVerificationSchema,
  type ResendVerificationFormValues,
} from "@/lib/validators/auth/resend-verification-schema";

type VerifyState = "loading" | "success" | "expired" | "invalid" | "no_token";

function ResendVerificationForm({ prefillEmail }: { prefillEmail?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: prefillEmail ?? "",
    },
  });

  const onSubmit = async (data: ResendVerificationFormValues) => {
    setServerError(null);

    try {
      await resendVerificationApi(data.email.trim().toLowerCase());
      setSubmitted(true);
      toast.success("Verification email sent.");
    } catch (error: unknown) {
      setServerError(getErrorMessage(error));
    }
  };

  if (submitted) {
    return (
      <AuthStatusPanel
        icon={Mail}
        tone="success"
        title="Verification email sent"
        description="Check your inbox and follow the new verification link to continue."
      />
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
      <AuthSectionHeader
        title="Request a new verification link"
        description="Enter your email address and we will send a fresh verification email."
      />

      <AuthInlineMessage type="error" message={serverError} />

      <AuthField
        htmlFor="resend-email"
        label="Email address"
        error={errors.email?.message}
        required
      >
        <AuthInput
          id="resend-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </AuthField>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size={16} />
            Sending email...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Resend verification email
          </>
        )}
      </Button>
    </motion.form>
  );
}

export function VerifyEmailCard() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, setState] = useState<VerifyState>(
    token ? "loading" : "no_token"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }

    const verifyToken = async () => {
      try {
        await api.post<ApiSuccessResponse>(`/api/auth/verify-email?token=${token}`);
        setState("success");
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        const normalized = message.toLowerCase();

        if (normalized.includes("expired") || normalized.includes("expire")) {
          setState("expired");
        } else {
          setState("invalid");
        }

        setErrorMessage(message);
      }
    };

    verifyToken();
  }, [token]);

  if (state === "loading") {
    return (
      <AuthStatusPanel
        icon={Mail}
        title="Verifying your email"
        description="Please wait while we confirm your account verification link."
      >
        <div className="flex justify-center">
          <LoadingSpinner size={18} />
        </div>
      </AuthStatusPanel>
    );
  }

  if (state === "success") {
    return (
      <AuthStatusPanel
        icon={CheckCircle2}
        tone="success"
        title="Email verified"
        description="Your email address has been confirmed successfully. Your account will remain pending until an administrator approves access."
      >
        <div className="space-y-3">
          <AuthInlineMessage
            type="info"
            message="You will be able to sign in after admin approval is complete."
          />
          <Button asChild className="w-full">
            <Link href={AUTH_ROUTES.LOGIN}>Back to sign in</Link>
          </Button>
        </div>
      </AuthStatusPanel>
    );
  }

  if (state === "expired") {
    return (
      <div className="space-y-6">
        <AuthStatusPanel
          icon={Clock3}
          tone="warning"
          title="Verification link expired"
          description="This verification link is no longer valid. Request a new email to continue your account setup."
        >
          <AuthInlineMessage type="info" message={errorMessage || null} />
        </AuthStatusPanel>
        <ResendVerificationForm />
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="space-y-6">
        <AuthStatusPanel
          icon={AlertCircle}
          tone="danger"
          title="Invalid verification link"
          description="This verification link is invalid, already used, or no longer available."
        >
          <AuthInlineMessage type="error" message={errorMessage || null} />
        </AuthStatusPanel>
        <ResendVerificationForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AuthStatusPanel
        icon={Mail}
        tone="neutral"
        title="Verify your email"
        description="Use the link from your inbox to verify your email address, or request a new verification email below."
      />
      <ResendVerificationForm />
    </div>
  );
}
