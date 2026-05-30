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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white border border-[#E4E7EC] rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1736] px-6 py-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">
              Review Registration
            </h3>
            <p className="text-sm text-white mt-0.5 opacity-90">
              {user.fullName} · {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#FFFFFF] hover:text-white transition-colors ml-4 opacity-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {error && <FormMessage type="error" message={error} />}

          {/* Decision Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setDecision("APPROVE");
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 h-12 rounded-lg
                          border text-sm font-semibold transition-all
                          ${
                            decision === "APPROVE"
                              ? "bg-[#ECFDF5] border-[#A6F4C5] text-[#065F46]"
                              : "bg-[#F9FAFC] border-[#E4E7EC] text-[#475467] hover:border-[#A6F4C5] hover:bg-[#ECFDF5]"
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
              className={`flex items-center justify-center gap-2 h-12 rounded-lg
                          border text-sm font-semibold transition-all
                          ${
                            decision === "REJECT"
                              ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
                              : "bg-[#F9FAFC] border-[#E4E7EC] text-[#475467] hover:border-[#FECACA] hover:bg-[#FEF2F2]"
                          }`}
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>

          {/* Rejection reason */}
          {decision === "REJECT" && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#101828]">
                Rejection Reason <span className="text-[#F04438]">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this registration is being rejected..."
                rows={3}
                className="w-full rounded-lg border border-[#E4E7EC] bg-white
                           px-3 py-2.5 text-sm text-[#101828] placeholder:text-[#667085]
                           focus:outline-none focus:ring-2 focus:ring-[#0B1736]/30
                           focus:border-[#0B1736] resize-none transition-colors"
              />
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-11 rounded-lg border border-[#E4E7EC]
                         bg-[#F9FAFC] text-[#475467] hover:bg-[#F5F7FB]
                         font-medium text-sm transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!decision || loading}
              className={`flex-1 h-11 rounded-lg font-bold text-sm
                          flex items-center justify-center gap-2
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors shadow-lg
                          ${
                            decision === "REJECT"
                              ? "bg-[#F04438] hover:bg-[#D92D20] text-white shadow-[0_0_20px_rgba(240,68,56,0.15)]"
                              : "bg-[#0B1736] hover:bg-[#122347] text-white shadow-[0_0_20px_rgba(11,23,54,0.15)]"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
