"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Eye, AlertCircle, TrendingUp, Droplets, Gauge, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface MisuseAlert {
    id: string;
    vehicleId: number;
    vehiclePlate: string;
    alertType: "EXCESSIVE_REFUELING" | "UNUSUAL_QUANTITY" | "SUSPICIOUS_MILEAGE" | "ABNORMAL_CONSUMPTION" | "OFF_PATTERN_TIMING";
    severity: "LOW" | "MEDIUM" | "HIGH";
    date: string;
    details: string;
    status: "PENDING" | "REVIEWED" | "RESOLVED";
    recordId: number;
}

export default function FuelAlertsPage() {
    const [alerts, setAlerts] = useState<MisuseAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"ALL" | "PENDING" | "REVIEWED" | "RESOLVED">("ALL");

    useEffect(() => {
        detectMisuse();
    }, []);

    const detectMisuse = async () => {
        setLoading(true);
        try {
            const [fuelRes, vehiclesRes] = await Promise.all([
                api.get("/fuel"),
                api.get("/vehicles")
            ]);

            const records = fuelRes.data;
            const vehicles = vehiclesRes.data;
            const detectedAlerts: MisuseAlert[] = [];

            // Group records by vehicle
            const vehicleRecords = new Map<number, any[]>();
            records.forEach((r: any) => {
                const vehicleId = r.vehicle?.id || r.vehicleId;
                if (!vehicleRecords.has(vehicleId)) {
                    vehicleRecords.set(vehicleId, []);
                }
                vehicleRecords.get(vehicleId)!.push(r);
            });

            // Analyze each vehicle's records
            vehicleRecords.forEach((vRecords, vehicleId) => {
                const vehicle = vehicles.find((v: any) => v.id === vehicleId);
                if (!vehicle) return;

                const sorted = [...vRecords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                // Check for various misuse patterns
                for (let i = 0; i < sorted.length; i++) {
                    const record = sorted[i];

                    // 1. EXCESSIVE REFUELING - Multiple refills in short time span
                    if (i > 0) {
                        const prevRecord = sorted[i - 1];
                        const daysDiff = (new Date(record.date).getTime() - new Date(prevRecord.date).getTime()) / (1000 * 60 * 60 * 24);

                        if (daysDiff < 1 && record.quantity > 20) {
                            detectedAlerts.push({
                                id: `ALERT-${record.id}-EXCESSIVE`,
                                vehicleId: vehicle.id,
                                vehiclePlate: vehicle.licensePlate,
                                alertType: "EXCESSIVE_REFUELING",
                                severity: "HIGH",
                                date: record.date,
                                details: `Refilled ${record.quantity}L only ${daysDiff.toFixed(1)} days after previous refill`,
                                status: "PENDING",
                                recordId: record.id
                            });
                        }
                    }

                    // 2. UNUSUAL QUANTITY - Exceeds typical tank capacity (assume 60L max)
                    if (record.quantity > 60) {
                        detectedAlerts.push({
                            id: `ALERT-${record.id}-QUANTITY`,
                            vehicleId: vehicle.id,
                            vehiclePlate: vehicle.licensePlate,
                            alertType: "UNUSUAL_QUANTITY",
                            severity: "MEDIUM",
                            date: record.date,
                            details: `Refilled ${record.quantity}L, exceeds typical tank capacity`,
                            status: "PENDING",
                            recordId: record.id
                        });
                    }

                    // 3. SUSPICIOUS MILEAGE - Odometer reading decreases
                    if (i > 0) {
                        const prevRecord = sorted[i - 1];
                        if (record.mileage < prevRecord.mileage) {
                            detectedAlerts.push({
                                id: `ALERT-${record.id}-MILEAGE`,
                                vehicleId: vehicle.id,
                                vehiclePlate: vehicle.licensePlate,
                                alertType: "SUSPICIOUS_MILEAGE",
                                severity: "HIGH",
                                date: record.date,
                                details: `Odometer decreased from ${prevRecord.mileage}km to ${record.mileage}km`,
                                status: "PENDING",
                                recordId: record.id
                            });
                        }
                    }

                    // 4. ABNORMAL CONSUMPTION - Deviation > 50% from vehicle average
                    if (sorted.length >= 3 && i >= 2) {
                        const avgQuantity = sorted.slice(0, i).reduce((sum, r) => sum + r.quantity, 0) / i;
                        const deviation = Math.abs(record.quantity - avgQuantity) / avgQuantity * 100;

                        if (deviation > 50) {
                            detectedAlerts.push({
                                id: `ALERT-${record.id}-CONSUMPTION`,
                                vehicleId: vehicle.id,
                                vehiclePlate: vehicle.licensePlate,
                                alertType: "ABNORMAL_CONSUMPTION",
                                severity: "MEDIUM",
                                date: record.date,
                                details: `Fuel amount (${record.quantity}L) deviates ${deviation.toFixed(0)}% from average (${avgQuantity.toFixed(1)}L)`,
                                status: "PENDING",
                                recordId: record.id
                            });
                        }
                    }
                }
            });

            // Sort by severity and date
            detectedAlerts.sort((a, b) => {
                const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                    return severityOrder[b.severity] - severityOrder[a.severity];
                }
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setAlerts(detectedAlerts);
        } catch (error: any) {
            console.error("Failed to detect misuse:", error);
            toast.error("Failed to analyze fuel records");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkReviewed = (alertId: string) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: "REVIEWED" } : a));
        toast.success("Alert marked as reviewed");
    };

    const handleResolve = (alertId: string) => {
        setAlerts(alerts.map(a => a.id === alertId ? { ...a, status: "RESOLVED" } : a));
        toast.success("Alert resolved");
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
                return <AlertCircle className="h-4 w-4" />;
            case "OFF_PATTERN_TIMING":
                return <Clock className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getSeverityBadge = (severity: string) => {
        const colors = {
            HIGH: "bg-red-100 text-red-700 border-red-200",
            MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
            LOW: "bg-blue-100 text-blue-700 border-blue-200"
        };
        return colors[severity as keyof typeof colors] || colors.LOW;
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            PENDING: "bg-red-100 text-red-700",
            REVIEWED: "bg-amber-100 text-amber-700",
            RESOLVED: "bg-green-100 text-green-700"
        };
        return colors[status as keyof typeof colors] || colors.PENDING;
    };

    const formatAlertType = (type: string) => {
        return type.split("_").map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(" ");
    };

    const filteredAlerts = filter === "ALL"
        ? alerts
        : alerts.filter(a => a.status === filter);

    const stats = {
        total: alerts.length,
        pending: alerts.filter(a => a.status === "PENDING").length,
        high: alerts.filter(a => a.severity === "HIGH").length
    };

    return (
        <ModuleLayout title="Fuel Misuse Alerts">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Misuse Detection</h2>
                        <p className="text-slate-500 font-medium">Automated analysis of unusual fuel consumption patterns</p>
                    </div>
                    <Button onClick={detectMisuse} variant="outline" disabled={loading}>
                        {loading ? "Analyzing..." : "Refresh Analysis"}
                    </Button>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                            <p className="text-xs text-slate-500">Detected issues</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Eye className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.pending}</div>
                            <p className="text-xs text-slate-500">Needs attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-700">{stats.high}</div>
                            <p className="text-xs text-slate-500">Critical alerts</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {["ALL", "PENDING", "REVIEWED", "RESOLVED"].map(status => (
                        <Button
                            key={status}
                            variant={filter === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFilter(status as any)}
                        >
                            {status}
                        </Button>
                    ))}
                </div>

                {/* Alerts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detected Alerts</CardTitle>
                        <CardDescription>Review and investigate flagged fuel records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <LoadingSkeleton type="table" rows={5} />
                        ) : filteredAlerts.length === 0 ? (
                            <EmptyState
                                icon={CheckCircle}
                                title="No alerts found"
                                description={filter === "ALL" ? "All fuel records look normal" : `No ${filter.toLowerCase()} alerts`}
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Alert ID</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Severity</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAlerts.map((alert) => (
                                        <TableRow key={alert.id}>
                                            <TableCell className="font-mono text-xs">{alert.id.split('-')[1]}</TableCell>
                                            <TableCell className="font-medium">{alert.vehiclePlate}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {getAlertIcon(alert.alertType)}
                                                    <span className="text-sm">{formatAlertType(alert.alertType)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSeverityBadge(alert.severity)}>
                                                    {alert.severity}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(alert.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 max-w-xs">
                                                {alert.details}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusBadge(alert.status)}>
                                                    {alert.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {alert.status === "PENDING" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleMarkReviewed(alert.id)}
                                                    >
                                                        Review
                                                    </Button>
                                                )}
                                                {alert.status === "REVIEWED" && (
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        onClick={() => handleResolve(alert.id)}
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}
