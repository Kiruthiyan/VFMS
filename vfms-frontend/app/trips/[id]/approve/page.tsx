"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft, CheckCircle, XCircle,
    Calendar, MapPin, Users, Loader2
} from "lucide-react";
import api from "@/lib/api";

interface Trip {
    id: string;
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    status: string;
    passengerCount: number;
}

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

export default function ApproveTripPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [form, setForm] = useState({
        approverId: "00000000-0000-0000-0000-000000000002",
        notes: "",
        assignedVehicleId: "",
        assignedDriverId: "",
    });
    const [rejectMode, setRejectMode] = useState(false);
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleApprove = async () => {
        setError("");
        if (!form.assignedVehicleId || !form.assignedDriverId) {
            setError("Please assign both a vehicle and a driver before approving");
            return;
        }
        setActionLoading("approve");
        try {
            await api.patch(`/trips/${id}/approve`, form);
            router.push(`/trips/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to approve trip");
        } finally {
            setActionLoading("");
        }
    };

    const handleReject = async () => {
        setError("");
        if (!form.notes.trim()) {
            setError("Rejection reason is required");
            return;
        }
        setActionLoading("reject");
        try {
            await api.patch(`/trips/${id}/reject`, form);
            router.push(`/trips/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reject trip");
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
            <div className="max-w-2xl mx-auto space-y-4">

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Trip Summary Card */}
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-lg font-bold">
                                    Review Trip Request
                                </CardTitle>
                                <p className="text-blue-200 text-sm mt-0.5">
                                    Approve or reject this trip request
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        {/* Trip info summary */}
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Purpose</span>
                                <span className="text-slate-900 font-medium text-sm">{trip.purpose}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                                <span className="text-slate-700 text-sm">{trip.destination}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                                <span className="text-slate-700 text-sm">
                                    {formatDate(trip.departureTime)} → {formatDate(trip.returnTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                                <span className="text-slate-700 text-sm">{trip.passengerCount} passengers</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Card */}
                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CardHeader className="bg-blue-950 py-4 rounded-t-xl">
                        <CardTitle className="text-white text-base font-bold">
                            {rejectMode ? "Reject Trip" : "Approve & Assign"}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">

                        {!rejectMode ? (
                            <>
                                {/* Assign Vehicle */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Assign Vehicle ID
                                    </label>
                                    <Input
                                        name="assignedVehicleId"
                                        placeholder="e.g. 00000000-0000-0000-0000-000000000003"
                                        value={form.assignedVehicleId}
                                        onChange={handleChange}
                                        className="bg-white text-slate-900 font-mono text-xs"
                                    />
                                    <p className="text-xs text-slate-400">
                                        Enter the vehicle UUID from the vehicle management module
                                    </p>
                                </div>

                                {/* Assign Driver */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Assign Driver ID
                                    </label>
                                    <Input
                                        name="assignedDriverId"
                                        placeholder="e.g. 00000000-0000-0000-0000-000000000004"
                                        value={form.assignedDriverId}
                                        onChange={handleChange}
                                        className="bg-white text-slate-900 font-mono text-xs"
                                    />
                                    <p className="text-xs text-slate-400">
                                        Enter the driver UUID from the driver management module
                                    </p>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Notes — optional
                                    </label>
                                    <textarea
                                        name="notes"
                                        placeholder="Any additional notes for this approval..."
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-slate-300 resize-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Rejection reason */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Rejection Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="notes"
                                        placeholder="Explain why this trip request is being rejected..."
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={4}
                                        className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:border-slate-300 resize-none"
                                    />
                                    <p className="text-xs text-red-500">
                                        A reason is required when rejecting a trip request
                                    </p>
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-3 pt-2">
                            {!rejectMode ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => { setRejectMode(true); setError(""); }}
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        onClick={handleApprove}
                                        disabled={actionLoading === "approve"}
                                        className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                    >
                                        {actionLoading === "approve" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <><CheckCircle className="mr-2 h-4 w-4" /> Approve</>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => { setRejectMode(false); setError(""); }}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={actionLoading === "reject"}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                    >
                                        {actionLoading === "reject" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <><XCircle className="mr-2 h-4 w-4" /> Confirm Reject</>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}