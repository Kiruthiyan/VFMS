"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X } from "lucide-react";
import { updateUserApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

interface EditUserDialogProps {
  user: UserSummary;
  onClose: () => void;
  onSuccess: (updated: UserSummary) => void;
}

interface EditFormValues {
  phone: string;
  department: string;
  officeLocation: string;
  designation: string;
  approvalLevel: string;
}

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30 " +
  "focus:border-[#0B1736] disabled:opacity-50 transition-colors";

export function EditUserDialog({
  user,
  onClose,
  onSuccess,
}: EditUserDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<EditFormValues>({
    defaultValues: {
      phone: user.phone ?? "",
      department: user.department ?? "",
      officeLocation: user.officeLocation ?? "",
      designation: user.designation ?? "",
      approvalLevel: user.approvalLevel ?? "",
    },
  });

  const onSubmit = async (data: EditFormValues) => {
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

      <div className="relative z-10 w-full max-w-md bg-white border border-[#E4E7EC] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1736] px-6 py-4 flex items-start justify-between">
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#101828]">
              Phone
            </label>
            <input
              type="tel"
              {...register("phone")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#101828]">
              Department
            </label>
            <input
              type="text"
              {...register("department")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#101828]">
              Office Location
            </label>
            <input
              type="text"
              {...register("officeLocation")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-[#101828]">
              Designation
            </label>
            <input
              type="text"
              {...register("designation")}
              disabled={isSubmitting}
              className={inputClass}
            />
          </div>

          {user.role === "APPROVER" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#101828]">
                Approval Level
              </label>
              <input
                type="text"
                placeholder="e.g. Level 1"
                {...register("approvalLevel")}
                disabled={isSubmitting}
                className={inputClass}
              />
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
