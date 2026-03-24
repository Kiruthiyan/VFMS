"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { loginSchema, LoginFormValues } from "@/lib/validators/auth/login-schema";
import { loginApi } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth-store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { Button } from "@/components/ui/button";

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  APPROVER: "/approvals/dashboard",
  SYSTEM_USER: "/dashboard",
  DRIVER: "/driver/dashboard",
};

export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
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

    const payload: LoginFormValues = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const response = await loginApi(payload);
      setAuth(response);
      router.replace(ROLE_REDIRECT[response.role] ?? "/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const apiMessage = (err.response?.data as { message?: string } | undefined)?.message;

        if (status === 401) {
          setServerError("Invalid email or password.");
          return;
        }

        if (status === 403) {
          setServerError(apiMessage ?? "Your account is disabled. Contact your administrator.");
          return;
        }

        if (status === 400) {
          setServerError(apiMessage ?? "Please check your details and try again.");
          return;
        }

        setServerError(apiMessage ?? "Unable to sign in right now. Please try again.");
        return;
      }

      setServerError("Unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {serverError && (
        <FormMessage type="error" message={serverError} className="border-red-300 bg-red-50/80" />
      )}

      {/* Email */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm
                     placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60
                     disabled:opacity-50"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p id="email-error" className="text-xs font-medium text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 shadow-sm
                       placeholder:text-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/60
                       disabled:opacity-50"
            disabled={isSubmitting}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={isSubmitting}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p id="password-error" className="text-xs font-medium text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      <p className="text-xs text-slate-500">
        By continuing, you agree to your organization&apos;s security and access policy.
      </p>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-black"
      >
        {isSubmitting && <LoadingSpinner size={14} />}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}