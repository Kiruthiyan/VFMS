"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, Calendar, MapPin, Users, Clock,
    Loader2, CheckCircle, XCircle, Play, Square, Ban
} from "lucide-react";
import api from "@/lib/api";
import { useRole } from "@/lib/roleContext";
import RoleSwitcher from "@/components/RoleSwitcher";

interface Trip {
    id: string;
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    status: string;
    passengerCount: number;
    distanceKm: number | null;
    assignedDriverId: string | null;
    assignedVehicleId: string | null;
    requesterId: string;
    approverId: string | null;
    approvalNotes: string | null;
    createdAt: string;
}

const statusStyles: Record<string, string> = {
    NEW: "bg-slate-50 text-slate-700 border-slate-200 font-bold",
    SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    APPROVED: "bg-green-50 text-green-700 border-green-200 font-bold",
    REJECTED: "bg-red-50 text-red-700 border-red-200 font-bold",
    ONGOING: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-300 font-bold",
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { currentUser } = useRole();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            setTrip(res.data);
        } catch (err) {
            console.error("Failed to fetch trip", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action: string) => {
        setActionLoading(action);
        try {
            await api.patch(`/trips/${id}/${action}`);
            await fetchTrip();
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${action} trip`);
        } finally {
            setActionLoading("");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500">Trip not found.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg font-bold">
                                        Trip Details
                                    </CardTitle>
                                    <p className="text-blue-200 text-xs mt-0.5 font-mono">
                                        {trip.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={statusStyles[trip.status]}
                            >
                                {trip.status}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">

                        {/* Purpose */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Purpose
                            </p>
                            <p className="text-slate-900 font-medium">{trip.purpose}</p>
                        </div>

                        {/* Destination */}
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Destination
                                </p>
                                <p className="text-slate-900 font-medium">{trip.destination}</p>
                            </div>
                        </div>

                        {/* Times */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Departure
                                    </p>
                                    <p className="text-slate-900 font-medium text-sm">
                                        {formatDate(trip.departureTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Return
                                    </p>
                                    <p className="text-slate-900 font-medium text-sm">
                                        {formatDate(trip.returnTime)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Passengers & Distance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Passengers
                                    </p>
                                    <p className="text-slate-900 font-medium">{trip.passengerCount}</p>
                                </div>
                            </div>
                            {trip.distanceKm && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Distance
                                    </p>
                                    <p className="text-slate-900 font-medium">{trip.distanceKm} km</p>
                                </div>
                            )}
                        </div>

                        {/* Assignments */}
                        {(trip.assignedDriverId || trip.assignedVehicleId) && (
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Assignments
                                </p>
                                {trip.assignedDriverId && (
                                    <p className="text-sm text-slate-700">
                                        Driver ID: <span className="font-mono text-xs">{trip.assignedDriverId}</span>
                                    </p>
                                )}
                                {trip.assignedVehicleId && (
                                    <p className="text-sm text-slate-700">
                                        Vehicle ID: <span className="font-mono text-xs">{trip.assignedVehicleId}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Approval Notes */}
                        {trip.approvalNotes && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                                    Notes
                                </p>
                                <p className="text-sm text-slate-700">{trip.approvalNotes}</p>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-slate-100" />

                        {/* Action Buttons based on status AND role */}
                        <div className="flex flex-wrap gap-3">

                            {/* System User actions */}
                            {currentUser.role === "SYSTEM_USER" && trip.status === "NEW" && (
                                <>
                                    <Button
                                        onClick={() => router.push(`/trips/${id}/edit`)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Edit Trip
                                    </Button>

                                    <Button
                                        onClick={() => handleAction("submit")}
                                        disabled={actionLoading === "submit"}
                                        className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                    >
                                        {actionLoading === "submit" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Submit for Approval"
                                        )}
                                    </Button>
                                </>
                            )}

                            {/* Staff actions */}
                            {currentUser.role === "STAFF" && trip.status === "SUBMITTED" && (
                                <Button
                                    onClick={() => router.push(`/trips/${id}/approve`)}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Review & Approve
                                </Button>
                            )}

                            {/* Driver actions */}
                            {currentUser.role === "DRIVER" && trip.status === "APPROVED" && (
                                <Button
                                    onClick={() => handleAction("start")}
                                    disabled={actionLoading === "start"}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                >
                                    {actionLoading === "start" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Start Trip
                                        </>
                                    )}
                                </Button>
                            )}

                            {currentUser.role === "DRIVER" && trip.status === "ONGOING" && (
                                <Button
                                    onClick={() => handleAction("complete")}
                                    disabled={actionLoading === "complete"}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {actionLoading === "complete" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Square className="mr-2 h-4 w-4" />
                                            Complete Trip
                                        </>
                                    )}
                                </Button>
                            )}

                            {/* Cancel — System User, Staff, Admin */}
                            {["SYSTEM_USER", "STAFF", "ADMIN"].includes(currentUser.role) &&
                                !["COMPLETED", "CANCELLED", "REJECTED"].includes(trip.status) && (
                                <Button
                                    onClick={() => handleAction("cancel")}
                                    disabled={actionLoading === "cancel"}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    {actionLoading === "cancel" ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Ban className="mr-2 h-4 w-4" />
                                            Cancel
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>

<RoleSwitcher />
    
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}