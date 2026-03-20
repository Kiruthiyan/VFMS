"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, X } from "lucide-react";
import { reviewUserApi, getErrorMessage } from "@/lib/api/admin";
import type { UserSummary } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";

interface ReviewDialogProps {
  user: UserSummary;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewDialog({
  user,
  onClose,
  onSuccess,
}: ReviewDialogProps) {
  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!decision) return;

    if (decision === "REJECT" && !rejectionReason.trim()) {
      setError("Please provide a rejection reason.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await reviewUserApi(user.id, {
        decision,
        rejectionReason:
          decision === "REJECT" ? rejectionReason : undefined,
      });

      toast.success(
        decision === "APPROVE"
          ? `${user.fullName} has been approved.`
          : `${user.fullName} has been rejected.`
      );
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/50 p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Review Registration
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {user.fullName} · {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors ml-4"
          >
            <X size={18} />
          </button>
        </div>

        {error && <FormMessage type="error" message={error} className="mb-4" />}

        {/* Decision Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => {
              setDecision("APPROVE");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl
                        border text-sm font-semibold transition-all
                        ${
                          decision === "APPROVE"
                            ? "bg-green-950/60 border-green-700 text-green-300"
                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-green-800 hover:text-green-400"
                        }`}
          >
            <CheckCircle2 size={16} />
            Approve
          </button>

          <button
            onClick={() => {
              setDecision("REJECT");
              setError(null);
            }}
            className={`flex items-center justify-center gap-2 h-12 rounded-xl
                        border text-sm font-semibold transition-all
                        ${
                          decision === "REJECT"
                            ? "bg-red-950/60 border-red-700 text-red-300"
                            : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-red-800 hover:text-red-400"
                        }`}
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>

        {/* Rejection reason */}
        {decision === "REJECT" && (
          <div className="mb-4 space-y-1.5">
            <label className="block text-sm font-medium text-slate-300">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this registration is being rejected..."
              rows={3}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60
                         px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500
                         focus:outline-none focus:ring-2 focus:ring-amber-500/60
                         focus:border-amber-500/60 resize-none transition-colors"
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-slate-700
                       bg-transparent text-slate-400 hover:bg-slate-800
                       font-medium text-sm transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!decision || loading}
            className={`flex-1 h-11 rounded-xl font-bold text-sm
                        flex items-center justify-center gap-2
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors
                        ${
                          decision === "REJECT"
                            ? "bg-red-600 hover:bg-red-500 text-white"
                            : "bg-amber-500 hover:bg-amber-400 text-slate-900"
                        }`}
          >
            {loading && <LoadingSpinner size={14} />}
            {loading
              ? "Processing..."
              : decision === "APPROVE"
              ? "Confirm Approve"
              : decision === "REJECT"
              ? "Confirm Reject"
              : "Select Decision"}
          </Button>
        </div>
      </div>
    </div>
  );
}
