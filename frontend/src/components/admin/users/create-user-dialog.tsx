"use client";

import { X, UserPlus } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { CreateUserRequest } from "@/lib/api/admin";
import { createUserApi, getErrorMessage, getFieldErrors } from "@/lib/api/admin";
import { ROLE_LABELS } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface CreateUserDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30 " +
  "focus:border-[#0B1736] disabled:opacity-50 transition-colors";

const labelClass = "block text-xs font-semibold text-[#344054] mb-1.5";

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "APPROVER", "SYSTEM_USER", "DRIVER"];

export function CreateUserDialog({
  onClose,
  onSuccess,
}: CreateUserDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<CreateUserRequest>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nic: "",
      role: "SYSTEM_USER",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: CreateUserRequest) => {
    setServerError(null);
    clearErrors();

    try {
      await createUserApi(data);
      toast.success(
        "User created successfully! A welcome email with a temporary password has been sent."
      );
      onSuccess();
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateUserRequest, {
            type: "server",
            message,
          });
        });
      }

      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-[#E4E7EC] bg-white shadow-lg">
        <div className="shrink-0 bg-[#0B1736] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F4B400]">
                <UserPlus className="h-4 w-4 text-[#0B1736]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  Create New User
                </h3>
                <p className="mt-0.5 text-xs text-white/70">
                  A temporary password will be emailed to the user
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 transition-colors hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 overflow-y-auto p-6"
        >
          {serverError && <FormMessage type="error" message={serverError} />}

          <div>
            <label className={labelClass}>Full Name *</label>
            <input
              type="text"
              placeholder="Enter full name"
              {...register("fullName", { required: "Full name is required" })}
              disabled={isSubmitting}
              className={inputClass}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <input
              type="email"
              placeholder="name@company.com"
              {...register("email", { required: "Email is required" })}
              disabled={isSubmitting}
              className={inputClass}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
	            <div>
	              <label className={labelClass}>Phone</label>
	              <input
                type="tel"
                placeholder="07XXXXXXXX"
                {...register("phone")}
	                disabled={isSubmitting}
	                className={inputClass}
	              />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
	            </div>
            <div>
              <label className={labelClass}>NIC *</label>
              <input
                type="text"
                placeholder="NIC number"
                {...register("nic", { required: "NIC is required" })}
                disabled={isSubmitting}
                className={inputClass}
              />
              {errors.nic && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nic.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Role *</label>
            <select
              {...register("role", { required: "Role is required" })}
              disabled={isSubmitting}
              className={inputClass}
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </div>

          {selectedRole === "DRIVER" && (
            <div className="space-y-3 rounded-lg border border-[#E4E7EC] bg-[#F9FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                Driver Details
              </p>
              <div className="grid grid-cols-2 gap-3">
	                <div>
	                  <label className={labelClass}>License No.</label>
	                  <input
                    type="text"
                    placeholder="License number"
                    {...register("licenseNumber")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.licenseNumber && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.licenseNumber.message}
                        </p>
                      )}
	                </div>
	                <div>
	                  <label className={labelClass}>License Expiry</label>
                  <input
                    type="date"
                    {...register("licenseExpiryDate")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.licenseExpiryDate && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.licenseExpiryDate.message}
                        </p>
                      )}
	                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Experience (yrs)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    {...register("experienceYears", { valueAsNumber: true })}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certifications</label>
                  <input
                    type="text"
                    placeholder="Certifications"
                    {...register("certifications")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}

          {(selectedRole === "SYSTEM_USER" ||
            selectedRole === "ADMIN") && (
            <div className="space-y-3 rounded-lg border border-[#E4E7EC] bg-[#F9FAFC] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#475467]">
                Staff Details
              </p>
              <div className="grid grid-cols-2 gap-3">
	                <div>
	                  <label className={labelClass}>Employee ID</label>
	                  <input
                    type="text"
                    placeholder="EMP-XXX"
                    {...register("employeeId")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.employeeId && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.employeeId.message}
                        </p>
                      )}
	                </div>
	                <div>
	                  <label className={labelClass}>Department</label>
                  <input
                    type="text"
                    placeholder="Department"
                    {...register("department")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.department && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.department.message}
                        </p>
                      )}
	                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
	                <div>
	                  <label className={labelClass}>Designation</label>
	                  <input
                    type="text"
                    placeholder="Designation"
                    {...register("designation")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.designation && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.designation.message}
                        </p>
                      )}
	                </div>
	                <div>
	                  <label className={labelClass}>Office Location</label>
                  <input
                    type="text"
                    placeholder="Office location"
                    {...register("officeLocation")}
	                    disabled={isSubmitting}
	                    className={inputClass}
	                  />
                      {errors.officeLocation && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.officeLocation.message}
                        </p>
                      )}
	                </div>
	              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-[#E4E7EC] bg-[#F9FAFC] text-sm font-medium text-[#475467] transition-colors hover:bg-[#F5F7FB] disabled:opacity-50 h-11"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0B1736] text-sm font-bold text-white shadow-lg shadow-[0_0_20px_rgba(11,23,54,0.15)] transition-colors hover:bg-[#122347] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <LoadingSpinner size={14} />}
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
