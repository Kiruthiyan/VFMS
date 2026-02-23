"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, CheckCircle, Clock, AlertCircle, Fuel, Route, Calendar, TrendingUp } from "lucide-react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

interface Trip {
    id: number;
    vehicleName: string;
    destination: string;
    status: string;
    scheduledTime: string;
}

export default function DriverDashboard() {
    const { user } = useAuthStore();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [stats, setStats] = useState({
        assignedTrips: 0,
        completedToday: 0,
        pendingTrips: 0,
        totalDistance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDriverData();
    }, []);

    const fetchDriverData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/trips/my-trips");
            const tripsData = response.data || [];
            setTrips(tripsData.slice(0, 5));

            const today = new Date().toDateString();
            const completedToday = tripsData.filter((t: Trip) =>
                t.status === "COMPLETED" &&
                new Date(t.scheduledTime).toDateString() === today
            ).length;

            setStats({
                assignedTrips: tripsData.length,
                completedToday,
                pendingTrips: tripsData.filter((t: Trip) => t.status === "PENDING" || t.status === "IN_PROGRESS").length,
                totalDistance: 0
            });
        } catch (error: any) {
            console.error("Failed to fetch driver data:", error);
            if (error.response?.status !== 404) {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        const configs: Record<string, { color: string; bg: string; icon: any; text: string }> = {
            PENDING: {
                color: "text-amber-700",
                bg: "bg-amber-50 border-amber-200",
                icon: Clock,
                text: "Pending"
            },
            IN_PROGRESS: {
                color: "text-blue-700",
                bg: "bg-blue-50 border-blue-200",
                icon: Route,
                text: "In Progress"
            },
            COMPLETED: {
                color: "text-green-700",
                bg: "bg-green-50 border-green-200",
                icon: CheckCircle,
                text: "Completed"
            },
            CANCELLED: {
                color: "text-red-700",
                bg: "bg-red-50 border-red-200",
                icon: AlertCircle,
                text: "Cancelled"
            }
        };
        return configs[status] || configs.PENDING;
    };

    return (
        <ModuleLayout title="Driver Dashboard">
            <div className="space-y-6">
                {/* Professional Welcome Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative flex items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Welcome back, {user?.name || "Driver"}!
                            </h1>
                            <p className="text-blue-100 text-lg font-medium">
                                Here's your trip overview for today
                            </p>
                        </div>
                        <div className="hidden md:flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                            <Truck className="h-10 w-10 text-white" />
                        </div>
                    </div>
                </div>

                {/* Professional Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Assigned Trips Card */}
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                        Assigned Trips
                                    </p>
                                    <p className="text-4xl font-black text-slate-900">
                                        {stats.assignedTrips}
                                    </p>
                                    <p className="text-xs text-slate-500">Total assignments</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                    <Route className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Completed Today Card */}
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                        Completed Today
                                    </p>
                                    <p className="text-4xl font-black text-slate-900">
                                        {stats.completedToday}
                                    </p>
                                    <p className="text-xs text-slate-500">Trips finished</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pending Trips Card */}
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                        Pending Trips
                                    </p>
                                    <p className="text-4xl font-black text-slate-900">
                                        {stats.pendingTrips}
                                    </p>
                                    <p className="text-xs text-slate-500">Awaiting action</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Total Distance Card */}
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow duration-200">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                                        Total Distance
                                    </p>
                                    <p className="text-4xl font-black text-slate-900">
                                        {stats.totalDistance} <span className="text-2xl font-bold text-slate-500">km</span>
                                    </p>
                                    <p className="text-xs text-slate-500">This month</p>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Trips Section */}
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900">Recent Trips</CardTitle>
                                <CardDescription className="mt-1">Your most recent trip assignments</CardDescription>
                            </div>
                            <Calendar className="h-5 w-5 text-slate-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {loading ? (
                            <LoadingSkeleton type="table" rows={3} />
                        ) : trips.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
                                    <Truck className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-lg font-semibold text-slate-900">No trips assigned yet</p>
                                <p className="text-sm text-slate-500 mt-1">Check back later for new assignments</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {trips.map((trip) => {
                                    const statusConfig = getStatusConfig(trip.status);
                                    const StatusIcon = statusConfig.icon;

                                    return (
                                        <div
                                            key={trip.id}
                                            className="group flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
                                                    <Truck className="h-6 w-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-slate-900">
                                                        {trip.vehicleName || `Trip #${trip.id}`}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                                                        <MapPin className="h-4 w-4" />
                                                        <span>{trip.destination || "Destination not set"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        }) : "Not scheduled"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {trip.scheduledTime ? new Date(trip.scheduledTime).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        }) : ""}
                                                    </p>
                                                </div>
                                                <Badge className={`${statusConfig.bg} ${statusConfig.color} border px-3 py-1.5 font-semibold`}>
                                                    <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                                                    {statusConfig.text}
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions - Professional Layout */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Fuel className="h-5 w-5 text-emerald-600" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-12 hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-700 transition-colors font-semibold"
                                onClick={() => window.location.href = "/fuel/entry"}
                            >
                                <Fuel className="mr-2 h-5 w-5" />
                                Log Fuel Entry
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start h-12 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-colors font-semibold"
                                onClick={() => window.location.href = "/trips"}
                            >
                                <Route className="mr-2 h-5 w-5" />
                                View All Trips
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                        <CardHeader>
                            <CardTitle className="text-lg">Today's Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {stats.pendingTrips > 0
                                        ? `You have ${stats.pendingTrips} pending trip${stats.pendingTrips > 1 ? 's' : ''} scheduled for today.`
                                        : "No trips scheduled for today. Enjoy your day!"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ModuleLayout>
    );
}
