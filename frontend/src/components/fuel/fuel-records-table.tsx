"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Fuel,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";

import {
  getErrorMessage,
  getFuelReceiptAccessUrlApi,
  type FuelRecord,
} from "@/lib/api/fuel";
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

  async function openReceipt(record: FuelRecord) {
    const receiptWindow = window.open("about:blank", "_blank", "noopener,noreferrer");

    try {
      const signedUrl = await getFuelReceiptAccessUrlApi(record.id);
      if (receiptWindow) {
        receiptWindow.location.href = signedUrl;
      } else {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      receiptWindow?.close();
      toast.error(getErrorMessage(error));
    }
  }

  if (records.length === 0) {
    return (
      <div className="py-14 text-center">
        <p className="text-sm text-slate-600">No fuel records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1080px] text-sm">
        <thead>
          <tr className="bg-slate-950">
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
                className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <Fragment key={record.id}>
              <tr
                className={cn(
                  "bg-white transition-colors duration-200 even:bg-slate-50/70 hover:bg-amber-50/35",
                  record.flaggedForMisuse && "bg-rose-50/60"
                )}
              >
                <td className="w-[250px] px-6 py-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-sm">
                      <Fuel size={17} />
                    </span>
                    <span>
                      <p className="font-bold text-slate-950">
                        {record.vehiclePlate}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {record.vehicleMakeModel}
                      </p>
                    </span>
                  </div>
                </td>

                <td className="w-[220px] px-6 py-5 font-semibold text-slate-700">
                  {record.driverName ?? "N/A"}
                </td>

                <td className="w-[150px] whitespace-nowrap px-6 py-5 font-medium text-slate-700">
                  {formatDate(record.fuelDate)}
                </td>

                <td className="w-[130px] whitespace-nowrap px-6 py-5 font-semibold text-slate-950">
                  {Number(record.quantity).toFixed(2)} L
                </td>

                <td className="w-[160px] whitespace-nowrap px-6 py-5 font-semibold text-slate-950">
                  {formatLKR(Number(record.totalCost))}
                </td>

                <td className="w-[130px] whitespace-nowrap px-6 py-5 font-medium text-slate-500">
                  {formatEfficiency(record.efficiencyKmPerLitre)}
                </td>

                <td className="w-[150px] whitespace-nowrap px-6 py-5">
                  <FuelFlagBadge
                    flagged={record.flaggedForMisuse}
                    reason={record.flagReason}
                  />
                </td>

                <td className="px-6 py-5 text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === record.id ? null : record.id)
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-slate-950"
                    aria-label={expandedId === record.id ? "Collapse record" : "Expand record"}
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
                  <td colSpan={8} className="px-6 py-5">
                    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Cost / Litre
                        </p>
                        <p className="font-semibold text-slate-900">
                          {formatLKR(Number(record.costPerLitre))}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Odometer
                        </p>
                        <p className="font-semibold text-slate-900">
                          {record.odometerReading.toLocaleString()} km
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Distance Since Last
                        </p>
                        <p className="font-semibold text-slate-900">
                          {record.distanceSinceLast != null
                            ? `${record.distanceSinceLast.toLocaleString()} km`
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Fuel Station
                        </p>
                        <p className="font-semibold text-slate-900">
                          {record.fuelStation ?? "N/A"}
                        </p>
                      </div>

                      {record.notes && (
                        <div className="sm:col-span-2 lg:col-span-4">
                          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Notes
                          </p>
                          <p className="text-slate-900">{record.notes}</p>
                        </div>
                      )}

                      {record.flagReason && (
                        <div className="sm:col-span-2 lg:col-span-4">
                          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Flag Reason
                          </p>
                          <p className="text-red-600">{record.flagReason}</p>
                        </div>
                      )}

                      {record.receiptUrl && (
                        <div>
                          <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            Receipt
                          </p>
                          <button
                            type="button"
                            onClick={() => openReceipt(record)}
                            className="inline-flex items-center gap-1 font-semibold text-amber-600 hover:text-amber-500"
                          >
                            <Receipt size={12} />
                            {record.receiptFileName ?? "View Receipt"}
                          </button>
                        </div>
                      )}

                      <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                          Recorded By
                        </p>
                        <p className="font-semibold text-slate-700">{record.createdBy}</p>
                      </div>

                      <div className="border-t border-slate-200 pt-3 sm:col-span-2 lg:col-span-4">
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
