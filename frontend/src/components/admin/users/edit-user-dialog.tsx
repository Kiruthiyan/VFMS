"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  getErrorMessage,
  getFieldErrors,
  updateUserApi,
  type UpdateUserRequest,
  type UserSummary,
} from "@/lib/api/admin";
import { ROLE_LABELS } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EditUserDialogProps {
  user: UserSummary;
  onClose: () => void;
  onSuccess: (updated?: UserSummary) => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30 " +
  "focus:border-[#0B1736] disabled:opacity-50 transition-colors";

const labelClass = "block text-xs font-semibold text-[#344054] mb-1.5";

const ROLE_OPTIONS: UserRole[] = ["ADMIN", "APPROVER", "SYSTEM_USER", "DRIVER"];

export function EditUserDialog({
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { isSubmitting, errors },
  } = useForm<UpdateUserRequest>({
    defaultValues: {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      nic: user.nic ?? "",
      role: user.role,
      licenseNumber: user.licenseNumber ?? "",
      licenseExpiryDate: user.licenseExpiryDate ?? "",
      certifications: user.certifications ?? "",
      experienceYears: user.experienceYears ?? undefined,
      employeeId: user.employeeId ?? "",
      department: user.department ?? "",
      officeLocation: user.officeLocation ?? "",
      designation: user.designation ?? "",
      approvalLevel: user.approvalLevel ?? "",
    },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: UpdateUserRequest) => {
    setServerError(null);
    clearErrors();

    try {
      const updated = await updateUserApi(user.id, data);
      toast.success("User details updated.");
      onSuccess(updated);
      onClose();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof UpdateUserRequest, {
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
        <div className="flex items-start justify-between bg-[#0B1736] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-white">Edit User</h3>
            <p className="mt-0.5 text-sm text-white opacity-90">
              {user.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 text-white opacity-90 transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 overflow-y-auto p-6"
        >
          {serverError && <FormMessage type="error" message={serverError} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                {...register("fullName")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
	            <div>
	              <label className={labelClass}>Phone</label>
	              <input
                type="tel"
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
	              <label className={labelClass}>NIC</label>
              <input
                type="text"
                {...register("nic")}
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
            <label className={labelClass}>Role</label>
            <select
              {...register("role")}
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
                    {...register("experienceYears", { valueAsNumber: true })}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Certifications</label>
                  <input
                    type="text"
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
