"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  Eye,
  TrendingUp,
  Droplets,
  Gauge,
  Clock,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/layout/admin-shell";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FormMessage } from "@/components/ui/form-message";
import {
  getAllFuelRecordsApi,
  getErrorMessage,
  type FuelRecord,
} from "@/lib/api/fuel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
// TYPES & INTERFACES
// ────────────────────────────────────────────────────────────────────────────

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

// ────────────────────────────────────────────────────────────────────────────
// ALERT DETECTION & ANALYSIS LOGIC
// ────────────────────────────────────────────────────────────────────────────

function analyzeAlerts(records: FuelRecord[]): FuelAlert[] {
  const alerts: FuelAlert[] = [];
  const vehicleMap = new Map<string, FuelRecord[]>();

  // Group records by vehicle plate
  records.forEach((record) => {
    const plate = record.vehiclePlate;
    if (!vehicleMap.has(plate)) {
      vehicleMap.set(plate, []);
    }
    vehicleMap.get(plate)!.push(record);
  });

  // Analyze each vehicle for anomalies
  vehicleMap.forEach((vehicleRecords, plate) => {
    if (vehicleRecords.length === 0) return;

    // Sort by date for chronological analysis
    const sorted = [...vehicleRecords].sort(
      (a, b) =>
        new Date(a.fuelDate).getTime() - new Date(b.fuelDate).getTime()
    );

    const avgQuantity =
      sorted.reduce((sum, r) => sum + r.quantity, 0) / sorted.length;
    const avgEfficiency =
      sorted
        .filter((r) => r.efficiencyKmPerLitre !== null)
        .reduce((sum, r) => sum + (r.efficiencyKmPerLitre || 0), 0) /
        sorted.length || 10;

    // Analyze each fuel record
    sorted.forEach((record, index) => {
      const vehicleId = record.vehicleId;

      // ALERT 1: EXCESSIVE_REFUELING - Multiple fills within 24 hours
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
            details: `Multiple refills: ${record.quantity}L refilled only ${hoursDiff.toFixed(
              1
            )} hours after previous fill`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }

      // ALERT 2: UNUSUAL_QUANTITY - Exceeds typical tank capacity
      if (record.quantity > 60) {
        alerts.push({
          id: `ALERT-${record.id}-QUANTITY`,
          vehicleId,
          vehiclePlate: plate,
          alertType: "UNUSUAL_QUANTITY",
          severity: "MEDIUM",
          date: record.fuelDate,
          details: `Unusually high quantity: ${record.quantity}L filled (typical capacity: ~60L)`,
          status: "PENDING",
          recordId: record.id,
        });
      }

      // ALERT 3: SUSPICIOUS_MILEAGE - Odometer inconsistencies
      if (index > 0) {
        const prevRecord = sorted[index - 1];

        // Odometer decreased (possible tampering)
        if (record.odometerReading < prevRecord.odometerReading) {
          alerts.push({
            id: `ALERT-${record.id}-MILEAGE-DOWN`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "SUSPICIOUS_MILEAGE",
            severity: "HIGH",
            date: record.fuelDate,
            details: `Odometer decreased from ${prevRecord.odometerReading}km to ${record.odometerReading}km (possible tampering)`,
            status: "PENDING",
            recordId: record.id,
          });
        }

        // Excessive mileage jump
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
            details: `Excessive mileage jump: +${mileageJump}km since last record (possible fraud)`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }

      // ALERT 4: ABNORMAL_CONSUMPTION - Deviation from baseline efficiency
      if (sorted.length >= 3 && index >= 2) {
        if (record.efficiencyKmPerLitre) {
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
              details: `Abnormal consumption: ${efficiency.toFixed(
                1
              )} km/L (avg: ${avgEfficiency.toFixed(
                1
              )} km/L, deviation: ${deviation.toFixed(0)}%)`,
              status: "PENDING",
              recordId: record.id,
            });
          }
        }
      }

      // ALERT 5: OFF_PATTERN_TIMING - Unusual refueling schedule
      if (index > 2) {
        const recentRecords = sorted.slice(Math.max(0, index - 5), index);
        const daysBetweenRefills = recentRecords
          .slice(1)
          .map((r, i) => {
            const prev = recentRecords[i];
            return (
              (new Date(r.fuelDate).getTime() -
                new Date(prev.fuelDate).getTime()) /
              (1000 * 60 * 60 * 24)
            );
          });

        const avgDaysBetween = Math.max(...daysBetweenRefills, 1);
        const currentDays =
          index > 0
            ? (new Date(record.fuelDate).getTime() -
                new Date(sorted[index - 1].fuelDate).getTime()) /
              (1000 * 60 * 60 * 24)
            : 0;

        if (currentDays > avgDaysBetween * 3 && currentDays > 14) {
          alerts.push({
            id: `ALERT-${record.id}-TIMING`,
            vehicleId,
            vehiclePlate: plate,
            alertType: "OFF_PATTERN_TIMING",
            severity: "LOW",
            date: record.fuelDate,
            details: `Off-pattern timing: ${currentDays.toFixed(
              0
            )} days since last fill (avg: ${avgDaysBetween.toFixed(0)} days)`,
            status: "PENDING",
            recordId: record.id,
          });
        }
      }
    });
  });

  // Sort by severity and date
  alerts.sort((a, b) => {
    const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[b.severity] - severityOrder[a.severity];
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return alerts;
}

// ────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export default function FuelAlertsPage() {
  const [alerts, setAlerts] = useState<FuelAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [alertStates, setAlertStates] = useState<
    Record<string, "PENDING" | "REVIEWED" | "RESOLVED">
  >({});

  const fetchAndAnalyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await getAllFuelRecordsApi();
      const detectedAlerts = analyzeAlerts(records);
      setAlerts(detectedAlerts);

      const states: Record<string, "PENDING" | "REVIEWED" | "RESOLVED"> = {};
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "EXCESSIVE_REFUELING":
        return <TrendingUp className="h-4 w-4" />;
      case "UNUSUAL_QUANTITY":
        return <Droplets className="h-4 w-4" />;
      case "SUSPICIOUS_MILEAGE":
        return <Gauge className="h-4 w-4" />;
      case "ABNORMAL_CONSUMPTION":
        return <AlertTriangle className="h-4 w-4" />;
      case "OFF_PATTERN_TIMING":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-900 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "LOW":
        return "bg-blue-100 text-blue-900 border-blue-200";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "PENDING":
        return "bg-red-100 text-red-900 border-red-200";
      case "REVIEWED":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "RESOLVED":
        return "bg-green-100 text-green-900 border-green-200";
      default:
        return "bg-slate-100 text-slate-900";
    }
  };

  const formatAlertType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const filteredAlerts =
    filter === "ALL"
      ? alerts
      : alerts.filter((a) => alertStates[a.id] === filter);

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => alertStates[a.id] === "PENDING").length,
    high: alerts.filter((a) => a.severity === "HIGH").length,
  };

  return (
    <AdminShell>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-2">
                Fuel Alerts & Anomalies
              </h1>
              <p className="text-slate-600 text-sm font-medium">
                Automated detection of suspicious fuel consumption patterns and misuse
              </p>
            </div>

            <button
              onClick={fetchAndAnalyze}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 whitespace-nowrap h-fit"
            >
              <RefreshCw
                size={18}
                strokeWidth={2.5}
                className={loading ? "animate-spin" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-24">
              <div className="text-center">
                <LoadingSpinner size={32} className="text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 font-500">Analyzing fuel records...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <FormMessage type="error" message={error} />
          )}

          {/* Dashboard Content */}
          {!loading && !error && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                {/* Total Alerts Card */}
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardHeader className="bg-blue-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Total Alerts
                      </CardTitle>
                      <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center">
                        <AlertTriangle
                          size={18}
                          className="text-blue-950"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">
                      {stats.total}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">
                      Detected anomalies
                    </p>
                  </CardContent>
                </Card>

                {/* Pending Alerts Card */}
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardHeader className="bg-blue-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        Pending Review
                      </CardTitle>
                      <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center">
                        <Eye
                          size={18}
                          className="text-blue-950"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">
                      {stats.pending}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">
                      Awaiting action
                    </p>
                  </CardContent>
                </Card>

                {/* High Severity Card */}
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardHeader className="bg-blue-950 py-4 border-b-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-bold text-white tracking-wider uppercase">
                        High Severity
                      </CardTitle>
                      <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center">
                        <AlertTriangle
                          size={18}
                          className="text-blue-950"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 pb-5">
                    <p className="text-4xl font-bold text-slate-900">
                      {stats.high}
                    </p>
                    <p className="text-sm text-slate-600 mt-2 font-medium">
                      Critical issues
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-2 mb-8 flex-wrap">
                {(["ALL", "PENDING", "REVIEWED", "RESOLVED"] as FilterStatus[]).map(
                  (filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        filter === filterOption
                          ? "bg-blue-950 text-white shadow-lg shadow-blue-200"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      {filterOption}
                    </button>
                  )
                )}
              </div>

              {/* Alerts Table */}
              {filteredAlerts.length === 0 ? (
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <CardContent className="py-16 text-center">
                    <CheckCircle
                      size={48}
                      className="mx-auto mb-4 text-emerald-600"
                    />
                    <p className="text-slate-900 font-bold text-lg mb-1">
                      No alerts found
                    </p>
                    <p className="text-slate-600">
                      {filter === "ALL"
                        ? "Great! No suspicious patterns detected."
                        : `No ${filter.toLowerCase()} alerts to display.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <CardHeader className="bg-blue-950 py-4 border-b border-slate-200">
                    <CardTitle className="text-white font-bold text-base">
                      Alert Details ({filteredAlerts.length})
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
                              Alert Type
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Details
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Severity
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold">
                              Status
                            </TableHead>
                            <TableHead className="text-slate-700 font-bold text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredAlerts.map((alert) => (
                            <TableRow
                              key={alert.id}
                              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              <TableCell className="font-semibold text-slate-900">
                                {alert.vehiclePlate}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getAlertIcon(alert.alertType)}
                                  <span className="text-sm font-500 text-slate-700">
                                    {formatAlertType(alert.alertType)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-slate-600 max-w-xs">
                                {alert.details}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${getSeverityColor(
                                    alert.severity
                                  )}`}
                                >
                                  {alert.severity}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`${getStatusColor(
                                    alertStates[alert.id]
                                  )}`}
                                >
                                  {alertStates[alert.id]}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {alertStates[alert.id] === "PENDING" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        handleMarkReviewed(alert.id)
                                      }
                                      className="text-xs"
                                    >
                                      Review
                                    </Button>
                                  )}
                                  {alertStates[alert.id] === "REVIEWED" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleResolve(alert.id)}
                                      className="text-xs"
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
      </div>
    </AdminShell>
  );
}
