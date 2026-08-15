"use client";

import { RentalStatus } from "@/lib/api/rental";
import { FleetTripUsageStatus } from "@/lib/api/trip-availability";

type RentalDisplayStatus = RentalStatus | FleetTripUsageStatus;

const statusConfig: Record<
  RentalDisplayStatus,
  { label: string; className: string }
> = {
    ACTIVE: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    },
    IN_TRIP_USE: {
      label: "In Trip Use",
      className: "bg-blue-50 text-blue-700 ring-blue-200",
    },
    RETURNED: {
      label: "Returned",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    },
    CLOSED: {
      label: "Closed",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
    },
  };

export function RentalStatusBadge({ status }: { status: RentalDisplayStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex max-w-full rounded-full px-2.5 py-1 text-xs font-semibold leading-4 tracking-wide ring-1 ${config.className}`}
    >
      <span className="truncate">{config.label}</span>
    </span>
  );
}
