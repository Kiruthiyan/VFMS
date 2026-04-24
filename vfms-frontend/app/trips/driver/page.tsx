"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar, MapPin, Users, Loader2,
    Play, Square, Car, Clock
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
    assignedVehicleId: string | null;
}

const statusStyles: Record<string, string> = {
    APPROVED: "bg-green-50 text-green-700 border-green-200 font-bold",
    ONGOING: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-300 font-bold",
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

export default function DriverTripsPage() {
    const router = useRouter();
    const driverId = "00000000-0000-0000-0000-000000000004";

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        try {
            const res = await api.get(`/trips/driver/${driverId}`);
            setTrips(res.data);
        } catch (err) {
            console.error("Failed to fetch driver trips", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (tripId: string, action: string) => {
        setActionLoading(`${tripId}-${action}`);
        try {
            await api.patch(`/trips/${tripId}/${action}`);
            await fetchTrips();
        } catch (err: any) {
            alert(err.response?.data?.message || `Failed to ${action} trip`);
        } finally {
            setActionLoading("");
        }
    };

    const ongoing = trips.filter(t => t.status === "ONGOING");
    const upcoming = trips.filter(t => t.status === "APPROVED");
    const history = trips.filter(t =>
        t.status === "COMPLETED" || t.status === "CANCELLED"
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    My Trips
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Your assigned trips and schedule
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Ongoing", value: ongoing.length, color: "text-purple-600" },
                    { label: "Upcoming", value: upcoming.length, color: "text-green-600" },
                    { label: "Completed", value: history.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
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

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                </div>
            ) : (
                <>
                    {/* Ongoing trips */}
                    {ongoing.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                                Ongoing
                            </h2>
                            {ongoing.map(trip => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    actionLoading={actionLoading}
                                    onAction={handleAction}
                                    onView={() => router.push(`/trips/${trip.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Upcoming trips */}
                    {upcoming.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                                Upcoming
                            </h2>
                            {upcoming.map(trip => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    actionLoading={actionLoading}
                                    onAction={handleAction}
                                    onView={() => router.push(`/trips/${trip.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* History */}
                    {history.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-wider">
                                History
                            </h2>
                            {history.map(trip => (
                                <TripCard
                                    key={trip.id}
                                    trip={trip}
                                    actionLoading={actionLoading}
                                    onAction={handleAction}
                                    onView={() => router.push(`/trips/${trip.id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {trips.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            No trips assigned to you yet.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function TripCard({ trip, actionLoading, onAction, onView }: {
    trip: Trip;
    actionLoading: string;
    onAction: (id: string, action: string) => void;
    onView: () => void;
}) {
    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit", month: "short",
            hour: "2-digit", minute: "2-digit"
        });

    const statusStyles: Record<string, string> = {
        APPROVED: "bg-green-50 text-green-700 border-green-200 font-bold",
        ONGOING: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
        COMPLETED: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
        CANCELLED: "bg-slate-100 text-slate-500 border-slate-300 font-bold",
    };

    return (
        <Card
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-200 transition-colors"
            onClick={onView}
        >
            <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge
                                variant="outline"
                                className={statusStyles[trip.status] || ""}
                            >
                                {trip.status}
                            </Badge>
                        </div>
                        <p className="font-bold text-slate-900">{trip.purpose}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin className="h-3.5 w-3.5 text-blue-950 shrink-0" />
                            {trip.destination}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(trip.departureTime)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {trip.passengerCount} pax
                            </span>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div
                        className="flex flex-col gap-2"
                        onClick={e => e.stopPropagation()}
                    >
                        {trip.status === "APPROVED" && (
                            <Button
                                size="sm"
                                onClick={() => onAction(trip.id, "start")}
                                disabled={actionLoading === `${trip.id}-start`}
                                className="bg-blue-950 hover:bg-blue-900 text-white text-xs"
                            >
                                {actionLoading === `${trip.id}-start` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <><Play className="h-3 w-3 mr-1" /> Start</>
                                )}
                            </Button>
                        )}
                        {trip.status === "ONGOING" && (
                            <Button
                                size="sm"
                                onClick={() => onAction(trip.id, "complete")}
                                disabled={actionLoading === `${trip.id}-complete`}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                            >
                                {actionLoading === `${trip.id}-complete` ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <><Square className="h-3 w-3 mr-1" /> Complete</>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}