interface Props {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  UNDER_MAINTENANCE: "bg-red-100 text-red-700",
  RENTED: "bg-blue-100 text-blue-700",
  RETIRED: "bg-gray-100 text-gray-700",
};

const STATUS_DOTS: Record<string, string> = {
  AVAILABLE: "bg-green-600",
  UNDER_MAINTENANCE: "bg-red-600",
  RENTED: "bg-blue-600",
  RETIRED: "bg-gray-600",
};

export function VehicleStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${STATUS_STYLES[status] || "bg-gray-100 text-gray-700"}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${STATUS_DOTS[status] || "bg-gray-600"}`}
      />
      {status.replace("_", " ")}
    </span>
  );
}
