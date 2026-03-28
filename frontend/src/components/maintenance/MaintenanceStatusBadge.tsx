"use client";

import { MaintenanceStatus } from "@/lib/api/maintenance";

const statusConfig: Record<MaintenanceStatus, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-slate-100 text-slate-700" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
  REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-700" },
};

export function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
