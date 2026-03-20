"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Receipt,
  ExternalLink,
} from "lucide-react";
import type { FuelRecord } from "@/lib/api/fuel";
import { FuelFlagBadge } from "./fuel-flag-badge";
import { formatLKR, formatEfficiency } from "@/lib/fuel-utils";
import { cn } from "@/lib/utils";

interface FuelRecordsTableProps {
  records: FuelRecord[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FuelRecordsTable({ records }: FuelRecordsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <div className="text-center py-14">
        <p className="text-slate-500 text-sm">No fuel records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            {[
              "Vehicle",
              "Driver",
              "Date",
              "Quantity",
              "Total Cost",
              "Efficiency",
              "Status",
              "",
            ].map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {records.map((record) => (
            <>
              <tr
                key={record.id}
                className={cn(
                  "hover:bg-slate-800/30 transition-colors",
                  record.flaggedForMisuse && "bg-red-950/10"
                )}
              >
                {/* Vehicle */}
                <td className="py-3.5 px-4">
                  <p className="font-medium text-slate-200">
                    {record.vehiclePlate}
                  </p>
                  <p className="text-xs text-slate-500">
                    {record.vehicleMakeModel}
                  </p>
                </td>

                {/* Driver */}
                <td className="py-3.5 px-4 text-slate-400">
                  {record.driverName ?? "—"}
                </td>

                {/* Date */}
                <td className="py-3.5 px-4 text-slate-400">
                  {formatDate(record.fuelDate)}
                </td>

                {/* Quantity */}
                <td className="py-3.5 px-4 text-slate-300">
                  {Number(record.quantity).toFixed(2)} L
                </td>

                {/* Cost */}
                <td className="py-3.5 px-4 text-slate-300">
                  {formatLKR(Number(record.totalCost))}
                </td>

                {/* Efficiency */}
                <td className="py-3.5 px-4 text-slate-400">
                  {formatEfficiency(record.efficiencyKmPerLitre)}
                </td>

                {/* Flag */}
                <td className="py-3.5 px-4">
                  <FuelFlagBadge
                    flagged={record.flaggedForMisuse}
                    reason={record.flagReason}
                  />
                </td>

                {/* Expand */}
                <td className="py-3.5 px-4">
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === record.id ? null : record.id
                      )
                    }
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    {expandedId === record.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </td>
              </tr>

              {/* Expanded detail */}
              {expandedId === record.id && (
                <tr key={`${record.id}-detail`} className="bg-slate-900/50">
                  <td colSpan={8} className="px-4 py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                      <div>
                        <p className="text-slate-500 mb-1">Cost / Litre</p>
                        <p className="text-slate-300">
                          LKR {Number(record.costPerLitre).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Odometer</p>
                        <p className="text-slate-300">
                          {record.odometerReading.toLocaleString()} km
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Distance Since Last</p>
                        <p className="text-slate-300">
                          {record.distanceSinceLast != null
                            ? `${record.distanceSinceLast.toLocaleString()} km`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Fuel Station</p>
                        <p className="text-slate-300">
                          {record.fuelStation ?? "—"}
                        </p>
                      </div>

                      {record.notes && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-slate-500 mb-1">Notes</p>
                          <p className="text-slate-300">{record.notes}</p>
                        </div>
                      )}

                      {record.flagReason && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="text-slate-500 mb-1">Flag Reason</p>
                          <p className="text-red-400">{record.flagReason}</p>
                        </div>
                      )}

                      {record.receiptUrl && (
                        <div>
                          <p className="text-slate-500 mb-1">Receipt</p>
                          <a
                            href={record.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300"
                          >
                            <Receipt size={12} />
                            {record.receiptFileName ?? "View Receipt"}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      <div>
                        <p className="text-slate-500 mb-1">Recorded By</p>
                        <p className="text-slate-300">{record.createdBy}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
