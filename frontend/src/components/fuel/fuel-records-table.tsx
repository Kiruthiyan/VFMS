"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Receipt,
} from "lucide-react";

import type { FuelRecord } from "@/lib/api/fuel";
import { formatEfficiency, formatLKR } from "@/lib/fuel-utils";
import { cn } from "@/lib/utils";

import { FuelFlagBadge } from "./fuel-flag-badge";

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
      <div className="py-14 text-center">
        <p className="text-sm text-slate-600">No fuel records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {[
              "Vehicle",
              "Driver",
              "Date",
              "Quantity",
              "Total Cost",
              "Efficiency",
              "Status",
              "",
            ].map((heading) => (
              <th
                key={heading}
                className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {records.map((record) => (
            <Fragment key={record.id}>
              <tr
                className={cn(
                  "transition-colors duration-200 hover:bg-slate-50",
                  record.flaggedForMisuse && "bg-rose-50/60"
                )}
              >
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-950">
                    {record.vehiclePlate}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {record.vehicleMakeModel}
                  </p>
                </td>

                <td className="px-5 py-4 font-medium text-slate-700">
                  {record.driverName ?? "N/A"}
                </td>

                <td className="px-5 py-4 font-medium text-slate-700">
                  {formatDate(record.fuelDate)}
                </td>

                <td className="px-5 py-4 font-semibold text-slate-950">
                  {Number(record.quantity).toFixed(2)} L
                </td>

                <td className="px-5 py-4 text-slate-950">
                  {formatLKR(Number(record.totalCost))}
                </td>

                <td className="px-5 py-4 text-slate-500">
                  {formatEfficiency(record.efficiencyKmPerLitre)}
                </td>

                <td className="px-5 py-4">
                  <FuelFlagBadge
                    flagged={record.flaggedForMisuse}
                    reason={record.flagReason}
                  />
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === record.id ? null : record.id)
                    }
                    className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950"
                  >
                    {expandedId === record.id ? (
                      <ChevronUp size={14} />
                    ) : (
                      <ChevronDown size={14} />
                    )}
                  </button>
                </td>
              </tr>

              {expandedId === record.id && (
                <tr className="bg-slate-50">
                  <td colSpan={8} className="px-4 py-4">
                    <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-xs md:grid-cols-4">
                      <div>
                        <p className="mb-1 font-medium text-slate-500">
                          Cost / Litre
                        </p>
                        <p className="text-slate-900">
                          LKR {Number(record.costPerLitre).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-slate-500">
                          Odometer
                        </p>
                        <p className="text-slate-900">
                          {record.odometerReading.toLocaleString()} km
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-slate-500">
                          Distance Since Last
                        </p>
                        <p className="text-slate-900">
                          {record.distanceSinceLast != null
                            ? `${record.distanceSinceLast.toLocaleString()} km`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 font-medium text-slate-500">
                          Fuel Station
                        </p>
                        <p className="text-slate-900">
                          {record.fuelStation ?? "N/A"}
                        </p>
                      </div>

                      {record.notes && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="mb-1 font-medium text-slate-500">
                            Notes
                          </p>
                          <p className="text-slate-900">{record.notes}</p>
                        </div>
                      )}

                      {record.flagReason && (
                        <div className="col-span-2 md:col-span-4">
                          <p className="mb-1 font-medium text-slate-500">
                            Flag Reason
                          </p>
                          <p className="text-red-600">{record.flagReason}</p>
                        </div>
                      )}

                      {record.receiptUrl && (
                        <div>
                          <p className="mb-1 text-slate-500">Receipt</p>
                          <a
                            href={record.receiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-500"
                          >
                            <Receipt size={12} />
                            {record.receiptFileName ?? "View Receipt"}
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}

                      <div>
                        <p className="mb-1 text-slate-500">Recorded By</p>
                        <p className="text-slate-700">{record.createdBy}</p>
                      </div>

                      <div className="col-span-2 border-t border-slate-200 pt-2 md:col-span-4">
                        <Link
                          href={`/admin/fuel/${record.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800"
                        >
                          <Eye size={14} />
                          View Full Details
                        </Link>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
