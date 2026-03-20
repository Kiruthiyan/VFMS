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
  "w-full rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2.5 " +
  "text-sm text-slate-100 placeholder:text-slate-500 " +
  "focus:outline-none focus:ring-2 focus:ring-amber-500/60 " +
  "focus:border-amber-500/60 disabled:opacity-50 transition-colors";

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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Edit User</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {user.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-4"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
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
            <label className="block text-sm font-medium text-slate-300">
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
            <label className="block text-sm font-medium text-slate-300">
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
            <label className="block text-sm font-medium text-slate-300">
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
              <label className="block text-sm font-medium text-slate-300">
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
            <Button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl border border-slate-700
                         bg-transparent text-slate-400 hover:bg-slate-800
                         font-medium text-sm transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 rounded-xl bg-amber-500 text-slate-900
                         hover:bg-amber-400 font-bold text-sm flex items-center
                         justify-center gap-2 disabled:opacity-60
                         disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting && <LoadingSpinner size={14} />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
