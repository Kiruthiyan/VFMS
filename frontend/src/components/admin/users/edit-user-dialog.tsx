"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";
import { updateUserApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary, UpdateUserRequest } from "@/lib/api/admin";
import type { UserRole } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

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
    watch,
    formState: { isSubmitting },
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

  const selectedRole = watch("role");

  const onSubmit = async (data: UpdateUserRequest) => {
    setServerError(null);
    try {
      const updated = await updateUserApi(user.id, data);
      toast.success("User details updated.");
      onSuccess(updated);
      onClose();
    } catch (err) {
      setServerError(getErrorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-white border border-[#E4E7EC] rounded-xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#0B1736] px-6 py-4 flex items-start justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold text-white">Edit User</h3>
            <p className="text-sm text-white mt-0.5 opacity-90">
              {user.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-white transition-colors ml-4 opacity-90"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-4 overflow-y-auto"
        >
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          {/* Full Name + Email */}
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

          {/* Phone + NIC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                {...register("phone")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>NIC</label>
              <input
                type="text"
                {...register("nic")}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* Role */}
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

          {/* ── DRIVER FIELDS ───────────────────────────────── */}
          {selectedRole === "DRIVER" && (
            <div className="space-y-3 p-4 bg-[#F9FAFC] rounded-lg border border-[#E4E7EC]">
              <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider">
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
                </div>
                <div>
                  <label className={labelClass}>License Expiry</label>
                  <input
                    type="date"
                    {...register("licenseExpiryDate")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
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

          {/* ── STAFF FIELDS ────────────────────────────────── */}
          {(selectedRole === "SYSTEM_USER" ||
            selectedRole === "APPROVER" ||
            selectedRole === "ADMIN") && (
            <div className="space-y-3 p-4 bg-[#F9FAFC] rounded-lg border border-[#E4E7EC]">
              <p className="text-xs font-semibold text-[#475467] uppercase tracking-wider">
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
                </div>
                <div>
                  <label className={labelClass}>Department</label>
                  <input
                    type="text"
                    {...register("department")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
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
                </div>
                <div>
                  <label className={labelClass}>Office Location</label>
                  <input
                    type="text"
                    {...register("officeLocation")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              </div>
              {selectedRole === "APPROVER" && (
                <div>
                  <label className={labelClass}>Approval Level</label>
                  <input
                    type="text"
                    placeholder="e.g. Level 1"
                    {...register("approvalLevel")}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-lg border border-[#E4E7EC]
                         bg-[#F9FAFC] text-[#475467] hover:bg-[#F5F7FB]
                         font-medium text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-lg bg-[#0B1736] text-white
                         hover:bg-[#122347] font-bold text-sm flex items-center
                         justify-center gap-2 disabled:opacity-60
                         disabled:cursor-not-allowed transition-colors shadow-lg shadow-[0_0_20px_rgba(11,23,54,0.15)]"
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
