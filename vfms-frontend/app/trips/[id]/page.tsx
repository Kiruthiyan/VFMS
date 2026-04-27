"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, Calendar, MapPin, Users, Clock,
    Loader2, CheckCircle, Play, Square, Ban, AlertTriangle, ThumbsUp, ThumbsDown
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
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    updatedAt: string;
}

const STATUS_STYLES: Record<string, string> = {
    NEW:              "bg-slate-50 text-slate-700 border-slate-200 font-bold",
    SUBMITTED:        "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    APPROVED:         "bg-green-50 text-green-700 border-green-200 font-bold",
    DRIVER_CONFIRMED: "bg-teal-50 text-teal-700 border-teal-200 font-bold",
    DRIVER_REJECTED:  "bg-orange-50 text-orange-700 border-orange-200 font-bold",
    REJECTED:         "bg-red-50 text-red-700 border-red-200 font-bold",
    ONGOING:          "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED:        "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED:        "bg-slate-100 text-slate-500 border-slate-300 font-bold",
};

const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED"];

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { currentUser } = useRole();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [driverRejectMode, setDriverRejectMode] = useState(false);
    const [driverRejectReason, setDriverRejectReason] = useState("");
    const [error, setError] = useState("");

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

    const handleAction = async (action: string, body?: object) => {
        setActionLoading(action);
        setError("");
        try {
            if (body) {
                await api.patch(`/trips/${id}/${action}`, body);
            } else {
                await api.patch(`/trips/${id}/${action}`);
            }
            await fetchTrip();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${action} trip`);
        } finally {
            setActionLoading("");
        }
    };

    const handleDriverReject = async () => {
        if (driverRejectReason.trim().length < 10) {
            setError("Please provide a reason of at least 10 characters");
            return;
        }
        await handleAction("driver-reject", { notes: driverRejectReason });
        setDriverRejectMode(false);
        setDriverRejectReason("");
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

    const isDriverRejectedNote = trip.approvalNotes?.startsWith("Driver rejected:");

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto space-y-4">

                <RoleSwitcher />

                <button
                    onClick={() => router.push("/trips")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg font-bold">Trip Details</CardTitle>
                                    <p className="text-blue-200 text-xs mt-0.5 font-mono">
                                        {trip.id.slice(0, 8)}...
                                    </p>
                                </div>
                            </div>
                            <Badge variant="outline" className={STATUS_STYLES[trip.status]}>
                                {trip.status.replace("_", " ")}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">

                        {/* Purpose */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                            <p className="text-slate-900 font-medium">{trip.purpose}</p>
                        </div>

                        {/* Destination */}
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Destination</p>
                                <p className="text-slate-900 font-medium">{trip.destination}</p>
                            </div>
                        </div>

                        {/* Times */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Departure</p>
                                    <p className="text-slate-900 font-medium text-sm">{formatDate(trip.departureTime)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Return</p>
                                    <p className="text-slate-900 font-medium text-sm">{formatDate(trip.returnTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Passengers & Distance */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-2">
                                <Users className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passengers</p>
                                    <p className="text-slate-900 font-medium">{trip.passengerCount}</p>
                                </div>
                            </div>
                            {trip.distanceKm && (
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                                    <p className="text-slate-900 font-medium">{trip.distanceKm} km</p>
                                </div>
                            )}
                        </div>

                        {/* Assignments */}
                        {(trip.assignedDriverId || trip.assignedVehicleId) && (
                            <div className="bg-slate-50 rounded-lg p-4 space-y-2 border border-slate-200">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
                                {trip.assignedDriverId && (
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <span className="font-medium text-slate-500">Driver:</span>
                                        <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">
                                            {trip.assignedDriverId}
                                        </span>
                                    </div>
                                )}
                                {trip.assignedVehicleId && (
                                    <div className="flex items-center gap-2 text-sm text-slate-700">
                                        <span className="font-medium text-slate-500">Vehicle:</span>
                                        <span className="font-mono text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">
                                            {trip.assignedVehicleId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Trip timestamps for ongoing/completed */}
                        {(trip.startTime || trip.endTime) && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Trip Timeline</p>
                                {trip.startTime && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                        <span className="text-slate-500 font-medium w-24">Trip Started</span>
                                        <span className="text-slate-900 font-semibold">{formatDate(trip.startTime)}</span>
                                    </div>
                                )}
                                {trip.endTime && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-slate-500 font-medium w-24">Trip Ended</span>
                                        <span className="text-slate-900 font-semibold">{formatDate(trip.endTime)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Approval / Driver rejection notes */}
                        {trip.approvalNotes && (
                            <div className={`border rounded-lg p-4 ${
                                isDriverRejectedNote
                                    ? "bg-orange-50 border-orange-200"
                                    : "bg-amber-50 border-amber-200"
                            }`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                    isDriverRejectedNote ? "text-orange-600" : "text-amber-600"
                                }`}>
                                    {isDriverRejectedNote ? "Driver Rejection Reason" : "Notes"}
                                </p>
                                <p className="text-sm text-slate-700">{trip.approvalNotes}</p>
                                {isDriverRejectedNote && (
                                    <p className="text-xs text-orange-500 mt-2 font-medium">
                                        Staff needs to assign a different driver.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="border-t border-slate-100" />

                        {/* Contextual status info for staff/admin on non-actionable trips */}
                        {currentUser.role === "STAFF" && trip.status === "NEW" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-700">Waiting for user submission</p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        This trip is still with the requester. Staff can review it once the user submits it for approval.
                                    </p>
                                </div>
                            </div>
                        )}
                        {currentUser.role === "STAFF" && trip.status === "APPROVED" && (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-teal-700">Awaiting driver confirmation</p>
                                    <p className="text-xs text-teal-600 mt-0.5">
                                        Driver has been assigned. Waiting for them to accept or reject the assignment.
                                    </p>
                                </div>
                            </div>
                        )}
                        {currentUser.role === "DRIVER" && trip.status === "DRIVER_CONFIRMED" && (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-teal-700">You have accepted this trip</p>
                                    <p className="text-xs text-teal-600 mt-0.5">Click Start Trip when you are ready to begin.</p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">

                            {/* System User: edit & submit */}
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
                                        className="flex-1 bg-blue-950 hover:bg-blue-900 text-white"
                                    >
                                        {actionLoading === "submit"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : "Submit for Approval"}
                                    </Button>
                                </>
                            )}

                            {/* Staff: review & assign (also for driver-rejected trips) */}
                            {currentUser.role === "STAFF" &&
                                ["SUBMITTED", "DRIVER_REJECTED"].includes(trip.status) && (
                                <Button
                                    onClick={() => router.push(`/trips/${id}/approve`)}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {trip.status === "DRIVER_REJECTED" ? "Reassign Driver & Vehicle" : "Review & Approve"}
                                </Button>
                            )}

                            {/* Driver: accept or reject the assignment */}
                            {currentUser.role === "DRIVER" && trip.status === "APPROVED" &&
                                trip.assignedDriverId === currentUser.id && (
                                <>
                                    {!driverRejectMode ? (
                                        <>
                                            <Button
                                                onClick={() => handleAction("driver-accept")}
                                                disabled={actionLoading === "driver-accept"}
                                                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white"
                                            >
                                                {actionLoading === "driver-accept"
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <><ThumbsUp className="mr-2 h-4 w-4" /> Accept Assignment</>}
                                            </Button>
                                            <Button
                                                onClick={() => setDriverRejectMode(true)}
                                                variant="outline"
                                                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                                            >
                                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject Assignment
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="w-full space-y-3">
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <p className="text-xs font-bold text-orange-700 mb-1">
                                                    Rejection Reason <span className="text-red-500">*</span>
                                                </p>
                                                <textarea
                                                    placeholder="Explain why you cannot accept this trip..."
                                                    value={driverRejectReason}
                                                    onChange={e => setDriverRejectReason(e.target.value)}
                                                    rows={3}
                                                    className="flex w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                                />
                                                <p className={`text-xs mt-1 ${driverRejectReason.trim().length >= 10 ? "text-green-600" : "text-slate-400"}`}>
                                                    {driverRejectReason.trim().length} / 10 chars minimum
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => { setDriverRejectMode(false); setDriverRejectReason(""); setError(""); }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleDriverReject}
                                                    disabled={actionLoading === "driver-reject" || driverRejectReason.trim().length < 10}
                                                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
                                                >
                                                    {actionLoading === "driver-reject"
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : "Confirm Rejection"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Driver: start confirmed trip */}
                            {currentUser.role === "DRIVER" && trip.status === "DRIVER_CONFIRMED" && (
                                <Button
                                    onClick={() => handleAction("start")}
                                    disabled={actionLoading === "start"}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white"
                                >
                                    {actionLoading === "start"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Play className="mr-2 h-4 w-4" /> Start Trip</>}
                                </Button>
                            )}

                            {/* Driver: complete ongoing trip */}
                            {currentUser.role === "DRIVER" && trip.status === "ONGOING" && (
                                <Button
                                    onClick={() => handleAction("complete")}
                                    disabled={actionLoading === "complete"}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                >
                                    {actionLoading === "complete"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Square className="mr-2 h-4 w-4" /> Complete Trip</>}
                                </Button>
                            )}

                            {/* Cancel — only SYSTEM_USER and ADMIN, not STAFF or DRIVER */}
                            {["SYSTEM_USER", "ADMIN"].includes(currentUser.role) &&
                                !TERMINAL_STATUSES.includes(trip.status) && (
                                <Button
                                    onClick={() => handleAction("cancel")}
                                    disabled={actionLoading === "cancel"}
                                    variant="outline"
                                    className="border-red-200 text-red-600 hover:bg-red-50"
                                >
                                    {actionLoading === "cancel"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Ban className="mr-2 h-4 w-4" /> Cancel</>}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
