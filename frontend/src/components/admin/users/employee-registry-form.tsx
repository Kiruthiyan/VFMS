"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { CreateEmployeeRegistryRequest } from "@/lib/api/admin";
import {
  createEmployeeRegistryApi,
  getErrorMessage,
  getFieldErrors,
} from "@/lib/api/admin";

interface EmployeeRegistryFormProps {
  onSuccess?: () => void;
}

const inputClass =
  "h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-sm shadow-slate-200/50 " +
  "focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 " +
  "disabled:opacity-50 transition-colors";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
const hintClass = "mt-1.5 text-xs leading-5 text-slate-500";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function SectionTitle({
  step,
  title,
}: {
  step: string;
  title: string;
}) {
  return (
    <h3 className="vfms-form-section-title">
      <span className="vfms-form-step">{step}</span>
      {title}
    </h3>
  );
}

export function EmployeeRegistryForm({ onSuccess }: EmployeeRegistryFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<CreateEmployeeRegistryRequest>({
    defaultValues: {
      employeeId: "",
      fullName: "",
      email: "",
      phone: "",
      nic: "",
      department: "",
      designation: "",
      officeLocation: "",
    },
  });

  const onSubmit = async (data: CreateEmployeeRegistryRequest) => {
    setServerError(null);
    clearErrors();

    try {
      await createEmployeeRegistryApi(data);
      toast.success("Employee registry record added.");
      reset();
      onSuccess?.();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateEmployeeRegistryRequest, {
            type: "server",
            message,
          });
        });
      }

      setServerError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && <FormMessage type="error" message={serverError} />}

      <div className="vfms-form-section">
        <SectionTitle step="1" title="Employee Details" />
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Employee ID *</label>
              <input
                type="text"
                placeholder="EMP-001"
                {...register("employeeId", { required: "Employee ID is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              <p className={hintClass}>Official company staff identifier.</p>
              {errors.employeeId && (
                <p className={errorClass}>{errors.employeeId.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                type="text"
                placeholder="Full name"
                {...register("fullName", { required: "Full name is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.fullName && (
                <p className={errorClass}>{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                placeholder="name@company.com"
                {...register("email", { required: "Email is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Phone *</label>
              <input
                type="tel"
                placeholder="0771234567"
                {...register("phone", { required: "Phone number is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>NIC *</label>
            <input
              type="text"
              placeholder="200012345678"
              {...register("nic", { required: "NIC is required." })}
              disabled={isSubmitting}
              className={inputClass}
            />
            {errors.nic && <p className={errorClass}>{errors.nic.message}</p>}
          </div>
        </div>
      </div>

      <div className="vfms-form-section">
        <SectionTitle step="2" title="Work Assignment" />
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label className={labelClass}>Department *</label>
              <input
                type="text"
                placeholder="Operations"
                {...register("department", { required: "Department is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.department && (
                <p className={errorClass}>{errors.department.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Designation *</label>
              <input
                type="text"
                placeholder="Coordinator"
                {...register("designation", { required: "Designation is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.designation && (
                <p className={errorClass}>{errors.designation.message}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>Office Location *</label>
              <input
                type="text"
                placeholder="Colombo"
                {...register("officeLocation", { required: "Office location is required." })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.officeLocation && (
                <p className={errorClass}>{errors.officeLocation.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white shadow-lg shadow-slate-950/15 transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting && <LoadingSpinner size={14} />}
          {isSubmitting ? "Saving..." : "Add Registry Record"}
        </button>
      </div>
    </form>
  );
}
