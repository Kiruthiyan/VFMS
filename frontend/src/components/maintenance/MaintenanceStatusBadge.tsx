"use client";

import { MaintenanceStatus } from "@/lib/api/maintenance";

const statusConfig: Record<
  MaintenanceStatus,
  { label: string; className: string }
> = {
  NEW: { label: "New", className: "bg-slate-100 text-slate-700 ring-slate-200" },
  SUBMITTED: { label: "Submitted", className: "bg-blue-50 text-blue-700 ring-blue-200" },
  APPROVED: { label: "Approved", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  REJECTED: { label: "Rejected", className: "bg-red-50 text-red-700 ring-red-200" },
  CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus;
}) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-semibold leading-4 ring-1 ${config.className}`}
    >
      <span className="truncate">{config.label}</span>
    </span>
  );
}
