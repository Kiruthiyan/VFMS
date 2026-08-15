interface Props {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  IN_TRIP_USE: "bg-blue-50 text-blue-700 ring-blue-200",
  UNDER_MAINTENANCE: "bg-red-50 text-red-700 ring-red-200",
  RETIRED: "bg-slate-100 text-slate-600 ring-slate-200",
};

const STATUS_DOTS: Record<string, string> = {
  AVAILABLE: "bg-emerald-600",
  IN_TRIP_USE: "bg-blue-600",
  UNDER_MAINTENANCE: "bg-red-600",
  RETIRED: "bg-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "AVAILABLE",
  IN_TRIP_USE: "IN TRIP USE",
  UNDER_MAINTENANCE: "UNDER MAINTENANCE",
  RETIRED: "RETIRED",
};

export function VehicleStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase leading-4 tracking-wide ring-1 ${STATUS_STYLES[status] || "bg-slate-100 text-slate-700 ring-slate-200"}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOTS[status] || "bg-slate-600"}`}
      />
      <span className="truncate">{STATUS_LABELS[status] || status.replace(/_/g, " ")}</span>
    </span>
  );
}
