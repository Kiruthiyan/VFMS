"use client";

import { useEffect, useState, useCallback } from "react";
import { Flag, RefreshCw, CheckCircle2, Link2, Plus } from "lucide-react";
import Link from "next/link";
import {
  getFlaggedFuelRecordsApi,
  getErrorMessage,
  unflagFuelRecordApi,
  type FuelRecord,
} from "@/lib/api/fuel";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export default function FlaggedRecordsPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unflaggingId, setUnflaggingId] = useState<string | null>(null);

  const flaggedRecords = records;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFlaggedFuelRecordsApi();
      setRecords(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleUnflag = async (recordId: string) => {
    setUnflaggingId(recordId);
    try {
      await unflagFuelRecordApi(recordId);
      await fetchAll();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUnflaggingId(null);
    }
  };

  const getRiskColor = (reason: string | null): string => {
    if (!reason) return "bg-slate-100 text-slate-900";
    if (reason.toLowerCase().includes("high"))
      return "bg-red-100 text-red-900 border border-red-200";
    if (reason.toLowerCase().includes("medium"))
      return "bg-amber-100 text-amber-900 border border-amber-200";
    return "bg-blue-100 text-blue-900 border border-blue-200";
  };

  const formatFlagReason = (reason: string | null) => {
    if (!reason) return "Suspicious activity";
    return reason;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <AdminShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                Flagged Fuel Records
              </h1>
              <p className="text-slate-600 text-sm font-medium">
                Review and manage flagged records for suspected misuse
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 h-fit">
              <Link
                href="/admin/fuel"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all duration-200 active:scale-95 whitespace-nowrap"
              >
                <Link2 size={18} strokeWidth={2.5} />
                <span>Dashboard</span>
              </Link>
              <button
                onClick={fetchAll}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap"
              >
                <RefreshCw
                  size={18}
                  strokeWidth={2.5}
                  className={loading ? "animate-spin" : ""}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="text-center">
                <LoadingSpinner size={32} className="text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-500">
                  Loading flagged records...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <FormMessage type="error" message={error} />
          )}

          {/* Content */}
          {!loading && !error && (
            <>
              {/* Summary Card */}
              <Card className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8">
                <CardHeader className="bg-blue-950 py-4 border-b-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                      Flagged Records
                    </CardTitle>
                    <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center">
                      <Flag size={18} className="text-blue-950" strokeWidth={2.5} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-5">
                  <p className="text-4xl font-bold text-slate-900">
                    {flaggedRecords.length}
                  </p>
                  <p className="text-sm text-slate-600 mt-2 font-medium">
                    Records under review
                  </p>
                </CardContent>
              </Card>

              {/* Flagged Records Table */}
              {flaggedRecords.length === 0 ? (
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardContent className="py-16 text-center">
                    <CheckCircle2
                      size={48}
                      className="mx-auto mb-4 text-emerald-600"
                    />
                    <p className="text-slate-900 font-bold text-lg mb-1">
                      No flagged records
                    </p>
                    <p className="text-slate-600">
                      All fuel records are clean and compliant with policies.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <CardHeader className="bg-blue-950 py-4 border-b border-slate-200">
                    <CardTitle className="text-white font-bold text-base">
                      All Flagged Records ({flaggedRecords.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b border-slate-200">
                            <TableHead className="text-slate-700 font-bold">
                              Vehicle
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Driver
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Date
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Quantity
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Cost
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Flag Reason
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {flaggedRecords.map((record) => (
                            <TableRow
                              key={record.id}
                              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              <TableCell className="font-semibold text-slate-900">
                                {record.vehiclePlate}
                              </TableCell>
                              <TableCell className="text-sm text-slate-700">
                                {record.driverName || "N/A"}
                              </TableCell>
                              <TableCell className="text-sm text-slate-700">
                                {formatDate(record.fuelDate)}
                              </TableCell>
                              <TableCell className="text-sm text-slate-700 font-500">
                                {record.quantity.toFixed(2)}L
                              </TableCell>
                              <TableCell className="text-sm text-slate-700 font-500">
                                ₹{record.totalCost.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${getRiskColor(
                                    record.flagReason
                                  )} text-xs`}
                                >
                                  {formatFlagReason(record.flagReason)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Link
                                    href={`/admin/fuel/${record.id}`}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 hover:border-blue-400 text-blue-600 hover:bg-blue-50 font-500 text-xs transition-all"
                                  >
                                    View
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleUnflag(record.id)}
                                    disabled={unflaggingId === record.id}
                                    className="text-xs"
                                  >
                                    {unflaggingId === record.id
                                      ? "Unflagging..."
                                      : "Unflag"}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
