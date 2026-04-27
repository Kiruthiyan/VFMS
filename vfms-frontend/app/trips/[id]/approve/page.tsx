"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowLeft, CheckCircle, XCircle,
    Calendar, MapPin, Users, Loader2, AlertTriangle, Car, User
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

interface VehicleOption {
    id: number;
    brand: string;
    model: string;
    plateNumber: string;
}

interface DriverOption {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
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
    const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
    const [drivers, setDrivers] = useState<DriverOption[]>([]);
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
        fetchVehicles();
        fetchDrivers();
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

    const fetchVehicles = async () => {
        try {
            const res = await api.get("/trips/available-vehicles");
            setVehicles(res.data);
        } catch (err) {
            console.error("Failed to fetch vehicles", err);
        }
    };

    const fetchDrivers = async () => {
        try {
            const res = await api.get("/trips/available-drivers");
            setDrivers(res.data);
        } catch (err) {
            console.error("Failed to fetch drivers", err);
        }
    };

    const handleApprove = async () => {
        setError("");
        if (!form.assignedVehicleId) {
            setError("Please select a vehicle before approving");
            return;
        }
        if (!form.assignedDriverId) {
            setError("Please select a driver before approving");
            return;
        }
        setActionLoading("approve");
        try {
            await api.patch(`/trips/${id}/approve`, {
                approverId: form.approverId,
                notes: form.notes,
                assignedVehicleId: Number(form.assignedVehicleId),
                assignedDriverId: form.assignedDriverId,
            });
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
        if (form.notes.trim().length < 10) {
            setError("Please provide a more detailed rejection reason (at least 10 characters)");
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

                <button
                    onClick={() => router.push("/trips")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                {/* Trip Summary */}
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
                        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-24 pt-0.5">Purpose</span>
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
                    <CardHeader className={`py-4 rounded-t-xl ${rejectMode ? "bg-red-600" : "bg-blue-950"}`}>
                        <CardTitle className="text-white text-base font-bold flex items-center gap-2">
                            {rejectMode ? (
                                <><XCircle className="h-4 w-4" /> Reject Trip Request</>
                            ) : (
                                <><CheckCircle className="h-4 w-4" /> Approve & Assign Resources</>
                            )}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 space-y-4">
                        {!rejectMode ? (
                            <>
                                {/* Vehicle Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Car className="h-4 w-4 text-slate-400" />
                                        Select Vehicle <span className="text-red-500">*</span>
                                    </label>
                                    {vehicles.length === 0 ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                                            No available vehicles at the moment
                                        </div>
                                    ) : (
                                        <select
                                            value={form.assignedVehicleId}
                                            onChange={(e) => setForm(f => ({ ...f, assignedVehicleId: e.target.value }))}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm hover:border-slate-300"
                                        >
                                            <option value="">-- Select a vehicle --</option>
                                            {vehicles.map(v => (
                                                <option key={v.id} value={v.id}>
                                                    {v.brand} {v.model} — {v.plateNumber}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        Showing only available vehicles
                                    </p>
                                </div>

                                {/* Driver Dropdown */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <User className="h-4 w-4 text-slate-400" />
                                        Select Driver <span className="text-red-500">*</span>
                                    </label>
                                    {drivers.length === 0 ? (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700">
                                            No active drivers at the moment
                                        </div>
                                    ) : (
                                        <select
                                            value={form.assignedDriverId}
                                            onChange={(e) => setForm(f => ({ ...f, assignedDriverId: e.target.value }))}
                                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm hover:border-slate-300"
                                        >
                                            <option value="">-- Select a driver --</option>
                                            {drivers.map(d => (
                                                <option key={d.id} value={d.id}>
                                                    {d.firstName} {d.lastName} — {d.employeeId}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    <p className="text-xs text-slate-400">
                                        Showing only active drivers
                                    </p>
                                </div>

                                {/* Notes */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Approval Notes
                                        <span className="ml-1 text-xs text-slate-400 font-normal">(optional)</span>
                                    </label>
                                    <textarea
                                        placeholder="Any additional notes for this approval..."
                                        value={form.notes}
                                        onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                        rows={3}
                                        className="flex w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all shadow-sm hover:border-slate-300 resize-none"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Warning banner */}
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-red-700">
                                            You are rejecting this trip request
                                        </p>
                                        <p className="text-xs text-red-600 mt-0.5">
                                            The requester will be notified with your reason. This action cannot be undone.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">
                                        Rejection Reason <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Explain clearly why this trip request is being rejected..."
                                        value={form.notes}
                                        onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                                        rows={5}
                                        className={`flex w-full rounded-xl border px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all shadow-sm resize-none ${
                                            form.notes.trim().length === 0
                                                ? "border-red-200 bg-red-50"
                                                : "border-slate-200 bg-white hover:border-slate-300"
                                        }`}
                                    />
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-red-500 font-medium">
                                            A detailed reason is required before rejecting
                                        </p>
                                        <span className={`text-xs font-medium ${
                                            form.notes.trim().length >= 10 ? "text-green-600" : "text-slate-400"
                                        }`}>
                                            {form.notes.trim().length} chars
                                            {form.notes.trim().length < 10 && " (min 10)"}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            {!rejectMode ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={() => { setRejectMode(true); setError(""); setForm(f => ({ ...f, notes: "" })); }}
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
                                            <><CheckCircle className="mr-2 h-4 w-4" /> Approve Trip</>
                                        )}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => { setRejectMode(false); setError(""); setForm(f => ({ ...f, notes: "" })); }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleReject}
                                        disabled={actionLoading === "reject" || form.notes.trim().length < 10}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                                    >
                                        {actionLoading === "reject" ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <><XCircle className="mr-2 h-4 w-4" /> Confirm Rejection</>
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