"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { X, AlertTriangle } from "lucide-react";
import { softDeleteUserApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

interface DeleteUserDialogProps {
  user: UserSummary;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-[#E4E7EC] bg-white px-3 py-2.5 " +
  "text-sm text-[#101828] placeholder:text-[#667085] " +
  "focus:outline-none focus:ring-2 focus:ring-red-500/30 " +
  "focus:border-red-400 disabled:opacity-50 transition-colors";

export function DeleteUserDialog({
  user,
  onClose,
  onSuccess,
}: DeleteUserDialogProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<{ reason: string }>({
    defaultValues: { reason: "" },
  });

  const onSubmit = async (data: { reason: string }) => {
    setServerError(null);
    try {
      await softDeleteUserApi(user.id, { reason: data.reason });
      toast.success(`${user.fullName} has been deleted.`);
      onSuccess();
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
        <div className="bg-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Delete User</h3>
              <p className="text-xs text-white/80 mt-0.5">
                This action can be reversed by restoring the user
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {serverError && (
            <FormMessage type="error" message={serverError} />
          )}

          {/* User info */}
          <div className="p-3 bg-[#F9FAFC] rounded-lg border border-[#E4E7EC]">
            <p className="text-sm font-medium text-[#101828]">
              {user.fullName}
            </p>
            <p className="text-xs text-[#667085]">{user.email}</p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700">
              This user will be deactivated and moved to the deleted users
              history. You can restore them later if needed.
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-[#344054] mb-1.5">
              Reason for deletion *
            </label>
            <textarea
              rows={3}
              placeholder="Please provide a reason for deleting this user..."
              {...register("reason", {
                required: "A deletion reason is required",
              })}
              disabled={isSubmitting}
              className={inputClass + " resize-none"}
            />
            {errors.reason && (
              <p className="text-xs text-red-500 mt-1">
                {errors.reason.message}
              </p>
            )}
          </div>

          {/* Buttons */}
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
              className="flex-1 h-11 rounded-lg bg-red-600 text-white
                         hover:bg-red-700 font-bold text-sm flex items-center
                         justify-center gap-2 disabled:opacity-60
                         disabled:cursor-not-allowed transition-colors
                         shadow-lg shadow-red-600/25"
            >
              {isSubmitting && <LoadingSpinner size={14} />}
              {isSubmitting ? "Deleting..." : "Delete User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
