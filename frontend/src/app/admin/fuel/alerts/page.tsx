"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Car,
  CheckCircle,
  Clock,
  Droplets,
  Eye,
  Filter,
  Flag,
  Gauge,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";


import { FuelManagementNav } from "@/components/admin/fuel/fuel-management-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { FormMessage } from "@/components/ui/form-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { queryKeys } from "@/lib/query-keys";

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
      return "whitespace-nowrap border-red-200 bg-red-50 text-red-700 ring-1 ring-red-200";
    case "MEDIUM":
      return "whitespace-nowrap border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "whitespace-nowrap border-slate-200 bg-slate-50 text-slate-700 ring-1 ring-slate-200";
  }
}

function statusClasses(status: FuelAlert["status"]) {
  switch (status) {
    case "PENDING":
      return "whitespace-nowrap border-red-200 bg-red-50 text-red-700 ring-1 ring-red-200";
    case "REVIEWED":
      return "whitespace-nowrap border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "whitespace-nowrap border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
  }
}

export default function FuelAlertsPage() {
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [alertStates, setAlertStates] = useState<
    Record<string, FuelAlert["status"]>
  >({});
  const {
    data: records = [],
    error,
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.fuelRecords,
    queryFn: getAllFuelRecordsApi,
  });
  const alerts = useMemo(() => analyzeAlerts(records), [records]);
  const errorMessage = error ? getErrorMessage(error) : null;

  useEffect(() => {
    setAlertStates((current) => {
      const states: Record<string, FuelAlert["status"]> = {};
      alerts.forEach((alert) => {
        states[alert.id] = current[alert.id] ?? alert.status;
      });
      return states;
    });
  }, [alerts]);

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

  const filterCounts: Record<FilterStatus, number> = {
    ALL: alerts.length,
    PENDING: stats.pending,
    REVIEWED: alerts.filter((alert) => alertStates[alert.id] === "REVIEWED")
      .length,
    RESOLVED: alerts.filter((alert) => alertStates[alert.id] === "RESOLVED")
      .length,
  };

  return (

      <div className="space-y-6">
        <div>
          <Button
            asChild
            variant="ghost"
            className="text-slate-600 hover:text-slate-900 -ml-4"
          >
            <Link href="/admin/fuel">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Fuel Dashboard
            </Link>
          </Button>
        </div>
        <PageHeader
          title="Fuel Alerts"
          description="Review fuel anomalies, misuse indicators, and records that need operational follow-up."
          icon={AlertTriangle}
          actions={
            <>
              <Button asChild variant="outline">
                <Link href="/admin/fuel/alerts/flagged">
                  <Flag size={16} />
                  Flagged Records
                </Link>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="vfms-refresh-button"
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh fuel alerts"
                title="Refresh fuel alerts"
              >
                <RefreshCw
                  size={16}
                  className={isFetching ? "animate-spin" : ""}
                />
              </Button>
            </>
          }
        />

        <FuelManagementNav />

        {loading && (
          <div className="flex justify-center py-24">
            <div className="text-center">
              <LoadingSpinner size={32} className="mx-auto mb-4 text-slate-950" />
              <p className="text-slate-600">Analyzing fuel records...</p>
            </div>
          </div>
        )}

        {errorMessage && !loading && <FormMessage type="error" message={errorMessage} />}

        {!loading && !errorMessage && (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Total Alerts
                    </p>
                    <p className="mt-3 text-4xl font-black text-slate-950">
                      {stats.total}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      Detected anomalies
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                    <AlertTriangle size={18} className="text-amber-700" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Pending Review
                    </p>
                    <p className="mt-3 text-4xl font-black text-slate-950">
                      {stats.pending}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      Awaiting action
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
                    <Eye size={18} className="text-amber-700" />
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      High Severity
                    </p>
                    <p className="mt-3 text-4xl font-black text-slate-950">
                      {stats.high}
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-600">
                      Critical issues
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
                    <AlertTriangle size={18} className="text-red-700" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="grid gap-5 p-5 lg:grid-cols-[1fr_18rem] lg:items-end">
                <div className="flex items-center gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                    <Filter size={20} strokeWidth={2.1} />
                  </span>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-950">
                      Alert Filters
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      Switch between pending, reviewed, and resolved alerts.
                    </p>
                  </div>
                </div>
                <div className="w-full">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                    Status
                  </label>
                  <Select
                    value={filter}
                    onValueChange={(value) => setFilter(value as FilterStatus)}
                  >
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm">
                      <SelectValue placeholder="All alerts" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-200 bg-white text-slate-900 shadow-xl">
                      {(
                        [
                          ["ALL", "All alerts"],
                          ["PENDING", "Pending"],
                          ["REVIEWED", "Reviewed"],
                          ["RESOLVED", "Resolved"],
                        ] as Array<[FilterStatus, string]>
                      ).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label} ({filterCounts[value]})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredAlerts.length === 0 ? (
              <Card className="rounded-[28px] shadow-sm">
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
              <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="vfms-card-header px-6 py-5 pl-8">
                    <CardTitle className="text-xl font-bold text-slate-950">
                      Alert Registry
                    </CardTitle>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      Alert Details ({filteredAlerts.length})
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table className="min-w-[760px] table-fixed text-left text-sm">
                      <TableHeader>
                        <TableRow className="border-b border-slate-900 bg-slate-950 hover:bg-slate-950">
                          <TableHead className="w-[17%] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Vehicle
                          </TableHead>
                          <TableHead className="w-[18%] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Alert Type
                          </TableHead>
                          <TableHead className="w-[29%] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Details
                          </TableHead>
                          <TableHead className="w-[10%] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Severity
                          </TableHead>
                          <TableHead className="w-[10%] px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Status
                          </TableHead>
                          <TableHead className="w-[16%] px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-white/90">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAlerts.map((alert) => (
                          <TableRow
                            key={alert.id}
                            className="group border-b border-slate-100 transition-colors hover:bg-slate-50/80"
                          >
                            <TableCell className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400 text-blue-950 shadow-sm ring-1 ring-black/5">
                                  <Car size={17} />
                                </span>
                                <span className="min-w-0 truncate font-bold text-slate-950">
                                  {alert.vehiclePlate}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3.5">
                              <div className="flex items-center gap-2">
                                {getAlertIcon(alert.alertType)}
                                <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
                                  {formatAlertType(alert.alertType)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-5 py-3.5 text-sm font-medium leading-5 text-slate-600">
                              <span
                                title={alert.details}
                                className="block max-w-full truncate"
                              >
                                {alert.details}
                              </span>
                            </TableCell>
                            <TableCell className="px-5 py-3.5">
                              <Badge className={severityClasses(alert.severity)}>
                                {alert.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3.5">
                              <Badge className={statusClasses(alertStates[alert.id])}>
                                {alertStates[alert.id]}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-5 py-3.5 text-right">
                              <div className="flex flex-nowrap items-center justify-end gap-1.5">
                                <Link
                                  href={`/admin/fuel/${alert.recordId}`}
                                  className="inline-flex h-8 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition-all hover:border-amber-200 hover:bg-amber-50"
                                >
                                  View
                                </Link>
                                {alertStates[alert.id] === "PENDING" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 whitespace-nowrap px-2.5 text-xs"
                                    onClick={() => handleMarkReviewed(alert.id)}
                                  >
                                    Review
                                  </Button>
                                )}
                                {alertStates[alert.id] === "REVIEWED" && (
                                  <Button
                                    size="sm"
                                    className="h-8 whitespace-nowrap px-2.5 text-xs"
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

  );
}
