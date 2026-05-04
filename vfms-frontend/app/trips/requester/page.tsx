"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus, Calendar, MapPin, Loader2,
    Clock, CheckCircle, XCircle, AlertCircle
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
    approvalNotes: string | null;
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

const statusIcons: Record<string, any> = {
    NEW: AlertCircle,
    SUBMITTED: Clock,
    APPROVED: CheckCircle,
    REJECTED: XCircle,
    ONGOING: Clock,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short",
        year: "numeric", hour: "2-digit", minute: "2-digit"
    });

export default function RequesterTripsPage() {
    const router = useRouter();
    const requesterId = "00000000-0000-0000-0000-000000000001";

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await api.get(`/trips/requester/${requesterId}/history`);
            setTrips(res.data);
        } catch (err) {
            console.error("Failed to fetch trips", err);
        } finally {
            setLoading(false);
        }
    };

    const filters = ["ALL", "NEW", "SUBMITTED", "APPROVED", "ONGOING", "COMPLETED", "REJECTED", "CANCELLED"];

    const filtered = activeFilter === "ALL"
        ? trips
        : trips.filter(t => t.status === activeFilter);

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        My Trip Requests
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Track all your trip requests and their status
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/trips/create")}
                    className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                >
                    <Plus className="mr-2 h-4 w-4" /> New Request
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: trips.length, color: "text-slate-900" },
                    { label: "Pending", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                    { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                    { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">
                            {stat.label}
                        </div>
                        <div className={`text-3xl font-black mt-2 ${stat.color}`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`
                            px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all
                            ${activeFilter === filter
                                ? "bg-blue-950 text-white"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                            }
                        `}
                    >
                        {filter}
                        {filter !== "ALL" && (
                            <span className="ml-1.5 opacity-70">
                                ({trips.filter(t => t.status === filter).length})
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Trip cards */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-slate-400 font-medium">No trips found.</p>
                    <Button
                        onClick={() => router.push("/trips/create")}
                        className="mt-4 bg-blue-950 hover:bg-blue-900 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create your first trip
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(trip => {
                        const StatusIcon = statusIcons[trip.status] || AlertCircle;
                        return (
                            <Card
                                key={trip.id}
                                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-200 transition-all"
                                onClick={() => router.push(`/trips/${trip.id}`)}
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">

                                            {/* Status badge */}
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={statusStyles[trip.status] || ""}
                                                >
                                                    <StatusIcon className="h-3 w-3 mr-1" />
                                                    {trip.status}
                                                </Badge>
                                            </div>

                                            {/* Purpose */}
                                            <p className="font-bold text-slate-900">
                                                {trip.purpose}
                                            </p>

                                            {/* Destination */}
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <MapPin className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                                                {trip.destination}
                                            </div>

                                            {/* Times */}
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(trip.departureTime)}
                                                </span>
                                            </div>

                                            {/* Rejection note */}
                                            {trip.status === "REJECTED" && trip.approvalNotes && (
                                                <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
                                                    <span className="font-bold">Reason: </span>
                                                    {trip.approvalNotes}
                                                </div>
                                            )}
                                        </div>

                                        {/* Arrow indicator */}
                                        <div className="text-slate-300 text-lg font-bold shrink-0">
                                            →
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}