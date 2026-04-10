"use client";

import { RentalStatus } from "@/lib/api/rental";

const statusConfig: Record<RentalStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300" },
  RETURNED: { label: "Returned", className: "bg-amber-100 text-amber-700 ring-1 ring-amber-300" },
  CLOSED: { label: "Closed", className: "bg-gray-100 text-gray-600 ring-1 ring-gray-300" },
};

export function RentalStatusBadge({ status }: { status: RentalStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}
