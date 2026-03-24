"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validators/auth/register-schema";
import { registerApi, getErrorMessage } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

// ── FIELD COMPONENT ───────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-amber-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  );
}

// ── INPUT CLASSES ─────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 focus:border-amber-500/60 " +
  "disabled:opacity-50 transition-colors";

// ── MAIN COMPONENT ────────────────────────────────────────────────────────

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      requestedRole: undefined,
      experienceYears: null,
    },
  });

  const selectedRole = watch("requestedRole");
  const isDriver = selectedRole === "DRIVER";
  const isStaff = selectedRole === "SYSTEM_USER";

  const onSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerApi({
        ...data,
        experienceYears: data.experienceYears ?? undefined,
      });
      setSuccessEmail(data.email);
      toast.success("Registration successful! Check your email.");
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
    }
  };

  // ── SUCCESS STATE ─────────────────────────────────────────────────────

  if (successEmail) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto">
          <svg
            className="w-8 h-8 text-amber-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-slate-100">
          Check your email
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          We sent a verification link to{" "}
          <span className="text-amber-400 font-medium">{successEmail}</span>.
          <br />
          Click the link to verify your email address.
        </p>
        <p className="text-xs text-slate-500">
          After verification, your account will be reviewed by an administrator.
        </p>
        <p className="text-xs text-slate-500 pt-2">
          Didn&apos;t receive it?{" "}
          <button
            onClick={() => setSuccessEmail(null)}
            className="text-amber-400 hover:text-amber-300 font-medium underline underline-offset-2"
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <FormMessage type="error" message={serverError} />
      )}

      {/* Role Selection */}
      <Field
        label="I am registering as"
        error={errors.requestedRole?.message}
        required
      >
        <div className="relative">
          <select
            {...register("requestedRole")}
            disabled={isSubmitting}
            defaultValue=""
            className={
              inputClass +
              " appearance-none pr-10 cursor-pointer"
            }
          >
            <option value="" disabled>
              Select your role
            </option>
            <option value="DRIVER">Driver</option>
            <option value="SYSTEM_USER">Staff / System User</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        </div>
      </Field>

      {/* Common Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" error={errors.fullName?.message} required>
          <input
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            {...register("fullName")}
            disabled={isSubmitting}
            className={inputClass}
          />
        </Field>

        <Field label="Phone Number" error={errors.phone?.message} required>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="0771234567"
            {...register("phone")}
            disabled={isSubmitting}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Email Address" error={errors.email?.message} required>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register("email")}
          disabled={isSubmitting}
          className={inputClass}
        />
      </Field>

      <Field label="NIC Number" error={errors.nic?.message} required>
        <input
          type="text"
          placeholder="199XXXXXXXXX"
          {...register("nic")}
          disabled={isSubmitting}
          className={inputClass}
        />
      </Field>

      {/* Driver-Specific Fields */}
      {isDriver && (
        <div className="space-y-4 pt-2 border-t border-slate-700/60">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
            Driver Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="License Number"
              error={errors.licenseNumber?.message}
              required
            >
              <input
                type="text"
                placeholder="B1234567"
                {...register("licenseNumber")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>

            <Field
              label="License Expiry Date"
              error={errors.licenseExpiryDate?.message}
              required
            >
              <input
                type="date"
                {...register("licenseExpiryDate")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
          </div>

          <Field
            label="Certifications"
            error={errors.certifications?.message}
          >
            <input
              type="text"
              placeholder="e.g. Heavy Vehicle, Defensive Driving"
              {...register("certifications")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </Field>

          <Field
            label="Years of Experience"
            error={errors.experienceYears?.message}
          >
            <input
              type="number"
              min={0}
              placeholder="0"
              {...register("experienceYears")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {/* Staff-Specific Fields */}
      {isStaff && (
        <div className="space-y-4 pt-2 border-t border-slate-700/60">
          <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
            Staff Details
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Employee ID"
              error={errors.employeeId?.message}
              required
            >
              <input
                type="text"
                placeholder="EMP-001"
                {...register("employeeId")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>

            <Field
              label="Department"
              error={errors.department?.message}
              required
            >
              <input
                type="text"
                placeholder="e.g. Operations"
                {...register("department")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Office Location"
              error={errors.officeLocation?.message}
            >
              <input
                type="text"
                placeholder="e.g. Head Office"
                {...register("officeLocation")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>

            <Field
              label="Designation"
              error={errors.designation?.message}
            >
              <input
                type="text"
                placeholder="e.g. Fleet Coordinator"
                {...register("designation")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}

      {/* Password Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-700/60">
        <Field label="Password" error={errors.password?.message} required>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              {...register("password")}
              disabled={isSubmitting}
              className={inputClass + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field
          label="Confirm Password"
          error={errors.confirmPassword?.message}
          required
        >
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter password"
              {...register("confirmPassword")}
              disabled={isSubmitting}
              className={inputClass + " pr-10"}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 rounded-xl bg-amber-500 text-slate-900 hover:bg-amber-400 
                   font-bold text-sm flex items-center justify-center gap-2 
                   disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {isSubmitting && <LoadingSpinner size={14} />}
        {isSubmitting ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-amber-400 hover:text-amber-300 font-medium"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
