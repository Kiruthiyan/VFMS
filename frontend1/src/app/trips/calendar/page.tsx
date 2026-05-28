"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2, MapPin } from "lucide-react";
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

const statusColors: Record<string, string> = {
    NEW: "bg-slate-100 text-slate-700",
    SUBMITTED: "bg-amber-100 text-amber-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    ONGOING: "bg-purple-100 text-purple-700",
    COMPLETED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-slate-100 text-slate-400 line-through",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function CalendarPage() {
    const router = useRouter();
    const today = new Date();

    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);

    useEffect(() => {
        fetchTrips();
    }, [year, month]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/trips/calendar?year=${year}&month=${month}`);
            setTrips(res.data);
        } catch (err) {
            console.error("Failed to fetch calendar trips", err);
        } finally {
            setLoading(false);
        }
    };

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
        setSelectedDay(null);
    };

    // Build calendar grid
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();

    const getTripsForDay = (day: number) => {
        return trips.filter(trip => {
            const d = new Date(trip.departureTime);
            return d.getFullYear() === year &&
                d.getMonth() + 1 === month &&
                d.getDate() === day;
        });
    };

    const selectedDayTrips = selectedDay ? getTripsForDay(selectedDay) : [];

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    Trip Calendar
                </h1>
                <p className="text-slate-500 font-medium mt-1">
                    Visual overview of all scheduled trips
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Calendar */}
                <div className="lg:col-span-2">
                    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <CardHeader className="bg-blue-950 py-4 rounded-t-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                        <Calendar className="h-5 w-5" />
                                    </div>
                                    <CardTitle className="text-white text-lg font-bold">
                                        {MONTHS[month - 1]} {year}
                                    </CardTitle>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={prevMonth}
                                        className="text-white hover:bg-blue-900 h-8 w-8"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={nextMonth}
                                        className="text-white hover:bg-blue-900 h-8 w-8"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4">
                            {/* Day headers */}
                            <div className="grid grid-cols-7 mb-2">
                                {DAYS.map(day => (
                                    <div
                                        key={day}
                                        className="text-center text-xs font-bold text-slate-400 uppercase py-2"
                                    >
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty cells before first day */}
                                    {Array.from({ length: firstDay }).map((_, i) => (
                                        <div key={`empty-${i}`} className="h-16" />
                                    ))}

                                    {/* Day cells */}
                                    {Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const dayTrips = getTripsForDay(day);
                                        const isToday =
                                            day === today.getDate() &&
                                            month === today.getMonth() + 1 &&
                                            year === today.getFullYear();
                                        const isSelected = selectedDay === day;

                                        return (
                                            <div
                                                key={day}
                                                onClick={() => setSelectedDay(
                                                    selectedDay === day ? null : day
                                                )}
                                                className={`
                                                    h-16 rounded-lg p-1.5 cursor-pointer
                                                    border transition-all
                                                    ${isSelected
                                                        ? "border-blue-950 bg-blue-50"
                                                        : "border-transparent hover:border-slate-200 hover:bg-slate-50"
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    text-xs font-bold mb-1 w-6 h-6 flex items-center
                                                    justify-center rounded-full
                                                    ${isToday
                                                        ? "bg-blue-950 text-white"
                                                        : "text-slate-700"
                                                    }
                                                `}>
                                                    {day}
                                                </div>
                                                <div className="space-y-0.5">
                                                    {dayTrips.slice(0, 2).map(trip => (
                                                        <div
                                                            key={trip.id}
                                                            className={`text-[10px] px-1 rounded truncate font-medium
                                                                ${statusColors[trip.status] || "bg-slate-100 text-slate-600"}
                                                            `}
                                                        >
                                                            {trip.destination}
                                                        </div>
                                                    ))}
                                                    {dayTrips.length > 2 && (
                                                        <div className="text-[10px] text-slate-400 px-1">
                                                            +{dayTrips.length - 2} more
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Side panel */}
                <div className="space-y-4">

                    {/* Month summary */}
                    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <CardHeader className="bg-blue-950 py-4 rounded-t-xl">
                            <CardTitle className="text-white text-base font-bold">
                                Month Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            {[
                                { label: "Total Trips", value: trips.length, color: "text-slate-900" },
                                { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                                { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
                                { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
                            ].map(item => (
                                <div key={item.label} className="flex justify-between items-center">
                                    <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                                    <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Selected day trips */}
                    {selectedDay && (
                        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <CardHeader className="bg-blue-950 py-4 rounded-t-xl">
                                <CardTitle className="text-white text-base font-bold">
                                    {selectedDay} {MONTHS[month - 1]}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                {selectedDayTrips.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-4">
                                        No trips on this day
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedDayTrips.map(trip => (
                                            <div
                                                key={trip.id}
                                                className="p-3 rounded-lg border border-slate-100 hover:border-blue-200 cursor-pointer transition-colors"
                                                onClick={() => router.push(`/trips/${trip.id}`)}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <Badge
                                                        variant="outline"
                                                        className={`text-xs font-bold ${
                                                            trip.status === "APPROVED" ? "bg-green-50 text-green-700 border-green-200" :
                                                            trip.status === "ONGOING" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                                            trip.status === "COMPLETED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                            "bg-slate-50 text-slate-600 border-slate-200"
                                                        }`}
                                                    >
                                                        {trip.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-bold text-slate-900 mb-1">
                                                    {trip.purpose}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <MapPin className="h-3 w-3" />
                                                    {trip.destination}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}