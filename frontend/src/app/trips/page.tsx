"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Calendar, MapPin, Clock, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Trip {
    id: number;
    vehicleId: number;
    driverId: number;
    startLocation: string;
    endLocation: string;
    startDate: string;
    endDate?: string;
    status: string;
}

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const response = await api.get("/trips");
            setTrips(response.data || []);
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            toast.error("Failed to load trips");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return {
                    label: "Completed",
                    className: "bg-green-100 text-green-700 border-green-200",
                    icon: CheckCircle
                };
            case "IN_PROGRESS":
                return {
                    label: "In Progress",
                    className: "bg-blue-100 text-blue-700 border-blue-200",
                    icon: AlertCircle
                };
            case "PENDING":
                return {
                    label: "Pending",
                    className: "bg-amber-100 text-amber-700 border-amber-200",
                    icon: Clock
                };
            case "CANCELLED":
                return {
                    label: "Cancelled",
                    className: "bg-red-100 text-red-700 border-red-200",
                    icon: XCircle
                };
            default:
                return {
                    label: status,
                    className: "bg-slate-100 text-slate-700 border-slate-200",
                    icon: AlertCircle
                };
        }
    };

    const stats = {
        total: trips.length,
        completed: trips.filter(t => t.status === "COMPLETED").length,
        inProgress: trips.filter(t => t.status === "IN_PROGRESS").length,
        pending: trips.filter(t => t.status === "PENDING").length
    };

    return (
        <ModuleLayout title="Trip Management">
            <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase">Total Trips</p>
                                <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase">Completed</p>
                                <p className="text-3xl font-black text-green-600 mt-1">{stats.completed}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase">In Progress</p>
                                <p className="text-3xl font-black text-blue-600 mt-1">{stats.inProgress}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase">Pending</p>
                                <p className="text-3xl font-black text-amber-600 mt-1">{stats.pending}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Trips Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Trips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                            </div>
                        ) : trips.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">No trips found</p>
                                <p className="text-sm text-slate-400 mt-1">Trips will appear here once created</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Trip ID</TableHead>
                                            <TableHead className="font-semibold">Route</TableHead>
                                            <TableHead className="font-semibold">Start Date</TableHead>
                                            <TableHead className="font-semibold">End Date</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trips.map((trip) => {
                                            const statusConfig = getStatusConfig(trip.status);
                                            const StatusIcon = statusConfig.icon;
                                            return (
                                                <TableRow key={trip.id} className="hover:bg-slate-50">
                                                    <TableCell className="font-mono text-sm">#{trip.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-slate-400" />
                                                            <span className="font-medium">{trip.startLocation}</span>
                                                            <span className="text-slate-400">→</span>
                                                            <span className="font-medium">{trip.endLocation}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(trip.startDate).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        {trip.endDate ? new Date(trip.endDate).toLocaleDateString() : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={statusConfig.className}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm">View Details</Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}
