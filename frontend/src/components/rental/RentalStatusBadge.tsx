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
      className: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300",
    },
    IN_TRIP_USE: {
      label: "In Trip Use",
      className: "bg-blue-100 text-blue-700 ring-1 ring-blue-300",
    },
    RETURNED: {
      label: "Returned",
      className: "bg-amber-100 text-amber-700 ring-1 ring-amber-300",
    },
    CLOSED: {
      label: "Closed",
      className: "bg-gray-100 text-gray-600 ring-1 ring-gray-300",
    },
  };

export function RentalStatusBadge({ status }: { status: RentalDisplayStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
