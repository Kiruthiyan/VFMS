"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Flag, Link2, RefreshCw } from "lucide-react";
import Link from "next/link";

import { AdminShell } from "@/components/layout/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getErrorMessage,
  getFlaggedFuelRecordsApi,
  type FuelRecord,
  unflagFuelRecordApi,
} from "@/lib/api/fuel";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function riskClasses(reason: string | null) {
  if (!reason) return "bg-slate-100 text-slate-700 border-slate-200";
  if (reason.toLowerCase().includes("high")) {
    return "bg-red-100 text-red-700 border-red-200";
  }
  if (reason.toLowerCase().includes("medium")) {
    return "bg-amber-100 text-amber-800 border-amber-200";
  }
  return "bg-blue-100 text-blue-700 border-blue-200";
}

export default function FlaggedRecordsPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unflaggingId, setUnflaggingId] = useState<string | null>(null);

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

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Flagged Fuel Records"
          description="Review records flagged for suspected misuse and clear them once resolved."
          icon={Flag}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/admin/fuel">
                  <Link2 size={16} />
                  Dashboard
                </Link>
              </Button>
              <Button variant="outline" onClick={fetchAll} disabled={loading}>
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </Button>
            </>
          }
        />

        {loading && (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-slate-600">Loading flagged records...</p>
            </div>
          </div>
        )}

        {error && !loading && <FormMessage type="error" message={error} />}

        {!loading && !error && (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Flagged Records
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Flag size={18} className="text-amber-700" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-slate-900">
                  {records.length}
                </p>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  Records under review
                </p>
              </CardContent>
            </Card>

            {records.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <CheckCircle2
                    size={48}
                    className="mx-auto mb-4 text-emerald-600"
                  />
                  <p className="mb-1 text-lg font-semibold text-slate-900">
                    No flagged records
                  </p>
                  <p className="text-slate-600">
                    All current fuel records are compliant.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-slate-950">
                    All Flagged Records ({records.length})
                    </CardTitle>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200 bg-slate-50">
                          <TableHead className="font-bold text-slate-700">
                            Vehicle
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Driver
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Date
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Quantity
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Cost
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Flag Reason
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow
                            key={record.id}
                            className="border-b border-slate-200 hover:bg-slate-50"
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
                            <TableCell className="text-sm font-medium text-slate-700">
                              {record.quantity.toFixed(2)}L
                            </TableCell>
                            <TableCell className="text-sm font-medium text-slate-700">
                              LKR {record.totalCost.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge className={`${riskClasses(record.flagReason)} text-xs`}>
                                {record.flagReason || "Suspicious activity"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/fuel/${record.id}`}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
                                >
                                  View
                                </Link>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUnflag(record.id)}
                                  disabled={unflaggingId === record.id}
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
    </AdminShell>
  );
}
