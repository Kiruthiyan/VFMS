"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
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
  getAllFuelRecordsApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";

interface FuelAlert {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  alertType:
    | "EXCESSIVE_REFUELING"
    | "UNUSUAL_QUANTITY"
    | "SUSPICIOUS_MILEAGE"
    | "ABNORMAL_CONSUMPTION"
    | "OFF_PATTERN_TIMING";
  severity: "LOW" | "MEDIUM" | "HIGH";
  date: string;
  details: string;
  status: "PENDING" | "REVIEWED" | "RESOLVED";
  recordId: string;
}

type FilterStatus = "ALL" | "PENDING" | "REVIEWED" | "RESOLVED";

function analyzeAlerts(records: FuelRecord[]): FuelAlert[] {
  const alerts: FuelAlert[] = [];
  const vehicleMap = new Map<string, FuelRecord[]>();

  records.forEach((record) => {
    const plate = record.vehiclePlate;
    if (!vehicleMap.has(plate)) {
      vehicleMap.set(plate, []);
    }
    vehicleMap.get(plate)!.push(record);
  });

  vehicleMap.forEach((vehicleRecords, plate) => {
    if (vehicleRecords.length === 0) return;

    const sorted = [...vehicleRecords].sort(
      (a, b) =>
        new Date(a.fuelDate).getTime() - new Date(b.fuelDate).getTime()
    );

    const avgEfficiency =
      sorted
        .filter((r) => r.efficiencyKmPerLitre !== null)
        .reduce((sum, r) => sum + (r.efficiencyKmPerLitre || 0), 0) /
        sorted.length || 10;

    sorted.forEach((record, index) => {
      const vehicleId = record.vehicleId;

      if (index > 0) {
        const prevRecord = sorted[index - 1];
        const hoursDiff =
          (new Date(record.fuelDate).getTime() -
            new Date(prevRecord.fuelDate).getTime()) /
          (1000 * 60 * 60);

        if (hoursDiff < 24 && record.quantity > 20) {
          alerts.push({
            id: `ALERT-${record.id}-EXCESSIVE`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "EXCESSIVE_REFUELING",
            severity: "HIGH",
            date: record.fuelDate,
            details: `Multiple refills: ${record.quantity}L only ${hoursDiff.toFixed(
              1
            )} hours after the previous fill.`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }

      if (record.quantity > 60) {
        alerts.push({
          id: `ALERT-${record.id}-QUANTITY`,
          vehicleId,
          vehiclePlate: plate,
          alertType: "UNUSUAL_QUANTITY",
          severity: "MEDIUM",
          date: record.fuelDate,
          details: `Unusually high quantity: ${record.quantity}L filled.`,
          status: "PENDING",
          recordId: record.id,
        });
      }

      if (index > 0) {
        const prevRecord = sorted[index - 1];

        if (record.odometerReading < prevRecord.odometerReading) {
          alerts.push({
            id: `ALERT-${record.id}-MILEAGE-DOWN`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "SUSPICIOUS_MILEAGE",
            severity: "HIGH",
            date: record.fuelDate,
            details: `Odometer decreased from ${prevRecord.odometerReading}km to ${record.odometerReading}km.`,
            status: "PENDING",
            recordId: record.id,
          });
        }

        const mileageJump =
          record.odometerReading - prevRecord.odometerReading;

        if (mileageJump > 1500) {
          alerts.push({
            id: `ALERT-${record.id}-MILEAGE-JUMP`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "SUSPICIOUS_MILEAGE",
            severity: "MEDIUM",
            date: record.fuelDate,
            details: `Large mileage jump: +${mileageJump}km since the previous record.`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }

      if (sorted.length >= 3 && index >= 2 && record.efficiencyKmPerLitre) {
        const efficiency = record.efficiencyKmPerLitre;
        const deviation =
          (Math.abs(efficiency - avgEfficiency) / avgEfficiency) * 100;

        if (deviation > 50) {
          alerts.push({
            id: `ALERT-${record.id}-CONSUMPTION`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "ABNORMAL_CONSUMPTION",
            severity: "MEDIUM",
            date: record.fuelDate,
            details: `Efficiency ${efficiency.toFixed(
              1
            )} km/L differs sharply from the average ${avgEfficiency.toFixed(
              1
            )} km/L.`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }

      if (index > 2) {
        const recentRecords = sorted.slice(Math.max(0, index - 5), index);
        const daysBetweenRefills = recentRecords.slice(1).map((r, i) => {
          const prev = recentRecords[i];
          return (
            (new Date(r.fuelDate).getTime() -
              new Date(prev.fuelDate).getTime()) /
            (1000 * 60 * 60 * 24)
          );
        });

        const avgDaysBetween = Math.max(...daysBetweenRefills, 1);
        const currentDays =
          (new Date(record.fuelDate).getTime() -
            new Date(sorted[index - 1].fuelDate).getTime()) /
          (1000 * 60 * 60 * 24);

        if (currentDays > avgDaysBetween * 3 && currentDays > 14) {
          alerts.push({
            id: `ALERT-${record.id}-TIMING`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "OFF_PATTERN_TIMING",
            severity: "LOW",
            date: record.fuelDate,
            details: `${currentDays.toFixed(
              0
            )} days since the previous fill, which is outside the usual pattern.`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }
    });
  });

  alerts.sort((a, b) => {
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return alerts;
}

function getAlertIcon(type: FuelAlert["alertType"]) {
  switch (type) {
    case "EXCESSIVE_REFUELING":
      return <TrendingUp className="h-4 w-4" />;
    case "UNUSUAL_QUANTITY":
      return <Droplets className="h-4 w-4" />;
    case "SUSPICIOUS_MILEAGE":
      return <Gauge className="h-4 w-4" />;
    case "OFF_PATTERN_TIMING":
      return <Clock className="h-4 w-4" />;
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
}

function formatAlertType(type: FuelAlert["alertType"]) {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

function severityClasses(severity: FuelAlert["severity"]) {
  switch (severity) {
    case "HIGH":
      return "bg-red-100 text-red-700 border-red-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200";
  }
}

function statusClasses(status: FuelAlert["status"]) {
  switch (status) {
    case "PENDING":
      return "bg-red-100 text-red-700 border-red-200";
    case "REVIEWED":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

export default function FuelAlertsPage() {
  const [alerts, setAlerts] = useState<FuelAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [alertStates, setAlertStates] = useState<
    Record<string, FuelAlert["status"]>
  >({});

  const fetchAndAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const records = await getAllFuelRecordsApi();
      const detectedAlerts = analyzeAlerts(records);
      setAlerts(detectedAlerts);

      const states: Record<string, FuelAlert["status"]> = {};
      detectedAlerts.forEach((alert) => {
        states[alert.id] = alert.status;
      });
      setAlertStates(states);
    } catch (err) {
      setError(getErrorMessage(err));
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAndAnalyze();
  }, [fetchAndAnalyze]);

  const handleMarkReviewed = (alertId: string) => {
    setAlertStates((prev) => ({ ...prev, [alertId]: "REVIEWED" }));
  };

  const handleResolve = (alertId: string) => {
    setAlertStates((prev) => ({ ...prev, [alertId]: "RESOLVED" }));
  };

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter((alert) => alertStates[alert.id] === filter);

  const stats = {
    total: alerts.length,
    pending: alerts.filter((alert) => alertStates[alert.id] === "PENDING")
      .length,
    high: alerts.filter((alert) => alert.severity === "HIGH").length,
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          title="Fuel Alerts"
          description="Detect suspicious fuel activity and review anomalies using the same VFMS admin pattern."
          icon={AlertTriangle}
          actions={
            <Button variant="outline" onClick={fetchAndAnalyze} disabled={loading}>
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
          }
        />

        {loading && (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-slate-600">Analyzing fuel records...</p>
            </div>
          </div>
        )}

        {error && !loading && <FormMessage type="error" message={error} />}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Total Alerts
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                      <AlertTriangle size={18} className="text-amber-700" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.total}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Detected anomalies
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Pending Review
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                      <Eye size={18} className="text-blue-700" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.pending}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Awaiting action
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        High Severity
                      </p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                      <AlertTriangle size={18} className="text-red-700" />
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-slate-900">
                    {stats.high}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Critical issues
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["ALL", "PENDING", "REVIEWED", "RESOLVED"] as FilterStatus[]).map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFilter(option)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                      filter === option
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-950/10"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                )
              )}
            </div>

            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <CheckCircle
                    size={48}
                    className="mx-auto mb-4 text-emerald-600"
                  />
                  <p className="mb-1 text-lg font-semibold text-slate-900">
                    No alerts found
                  </p>
                  <p className="text-slate-600">
                    {filter === "ALL"
                      ? "No suspicious patterns were detected."
                      : `No ${filter.toLowerCase()} alerts to display.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="border-b border-slate-200 px-6 py-4">
                    <CardTitle className="text-base font-semibold text-slate-950">
                    Alert Details ({filteredAlerts.length})
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
                            Alert Type
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Details
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Severity
                          </TableHead>
                          <TableHead className="font-bold text-slate-700">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-bold text-slate-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAlerts.map((alert) => (
                          <TableRow
                            key={alert.id}
                            className="border-b border-slate-200 hover:bg-slate-50"
                          >
                            <TableCell className="font-semibold text-slate-900">
                              {alert.vehiclePlate}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getAlertIcon(alert.alertType)}
                                <span className="text-sm text-slate-700">
                                  {formatAlertType(alert.alertType)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs text-sm text-slate-600">
                              {alert.details}
                            </TableCell>
                            <TableCell>
                              <Badge className={severityClasses(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusClasses(alertStates[alert.id])}>
                                {alertStates[alert.id]}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  href={`/admin/fuel/${alert.recordId}`}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50"
                                >
                                  View
                                </Link>
                                {alertStates[alert.id] === "PENDING" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleMarkReviewed(alert.id)}
                                  >
                                    Review
                                  </Button>
                                )}
                                {alertStates[alert.id] === "REVIEWED" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolve(alert.id)}
                                  >
                                    Resolve
                                  </Button>
                                )}
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
