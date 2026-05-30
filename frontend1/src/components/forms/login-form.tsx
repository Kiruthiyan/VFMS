"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import {
  AuthField,
  AuthFormLinks,
  AuthInlineMessage,
  AuthInput,
  PasswordField,
} from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getErrorMessage, loginApi, type AuthResponse } from "@/lib/api/auth";
import {
  AUTH_ROUTES,
  DEFAULT_ROUTES,
  PUBLIC_ROUTES,
  ROLE_DASHBOARDS,
  SETTINGS_ROUTES,
} from "@/lib/constants/routes";
import { canAccess } from "@/lib/rbac";
import { loginSchema, type LoginFormValues } from "@/lib/validators/auth/login-schema";
import { useAuthStore } from "@/store/auth-store";

function resolvePostLoginRedirect(
  response: AuthResponse,
  fromParam: string | null
): string {
  if (response.passwordChangeRequired) {
    return SETTINGS_ROUTES.CHANGE_PASSWORD;
  }

  if (fromParam && canAccess(response.role, fromParam)) {
    return fromParam;
  }

  return ROLE_DASHBOARDS[response.role] ?? DEFAULT_ROUTES.DEFAULT_DASHBOARD;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setServerError(null);

    try {
      const response = await loginApi({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      setAuth(response);
      router.replace(
        resolvePostLoginRedirect(response, searchParams.get("from"))
      );
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
      className="space-y-4"
      noValidate
    >
      <AuthInlineMessage type="error" message={serverError} />

      <div className="space-y-4">
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

        <PasswordField
          id="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          error={errors.password?.message}
          disabled={isSubmitting}
          required
          {...register("password")}
        />
      </div>

      <div className="flex items-center justify-end">
        <Link
          href={AUTH_ROUTES.FORGOT_PASSWORD}
          className="text-sm font-semibold text-slate-700 transition-colors hover:text-amber-600"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size={16} />
            Signing in...
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Sign in
          </>
        )}
      </Button>

      <AuthFormLinks
        prompt="Need a new account?"
        actionLabel="Sign up"
        actionHref={AUTH_ROUTES.SIGNUP}
        homeHref={PUBLIC_ROUTES.HOME}
      />
    </motion.form>
  );
}
