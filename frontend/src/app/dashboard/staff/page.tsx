import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Plus,
    Calendar,
    Clock,
    MapPin,
    CheckCircle2,
    AlertCircle,
    Car,
    Loader2
} from "lucide-react";
import api from "@/lib/api";
import { authService } from "@/lib/auth";

export default function StaffDashboardPage() {
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const user = authService.getUser();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/trips/requester/${user.id}`);
            setTrips(response.data);
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setIsLoading(false);
        }
    };

    const nextTrip = trips.find(t => t.status === "ASSIGNED" || t.status === "APPROVED");
    const pendingCount = trips.filter(t => t.status === "PENDING").length;
    const completedCount = trips.filter(t => t.status === "COMPLETED").length;
    const scheduledCount = trips.filter(t => t.status === "ASSIGNED" || t.status === "APPROVED").length;

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Staff Dashboard</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage your travel and vehicle requests.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/vehicles/maintenance/new">
                        <Button variant="outline" className="gap-2 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 h-11 rounded-xl">
                            <AlertCircle className="h-4 w-4" /> Report Issue
                        </Button>
                    </Link>
                    <Link href="/dashboard/trips/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2 font-bold h-11 rounded-xl shadow-lg shadow-blue-500/20">
                            <Plus className="h-4 w-4" /> New Trip Request
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50/50 border-blue-100 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-blue-800 uppercase tracking-widest">Scheduled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-blue-900">{scheduledCount}</div>
                        <p className="text-xs text-blue-600 font-medium mt-1">Confirmed upcoming trips</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/50 border-amber-100 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-amber-800 uppercase tracking-widest">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-amber-900">{pendingCount}</div>
                        <p className="text-xs text-amber-600 font-medium mt-1">Awaiting approval</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50/50 border-emerald-100 shadow-sm rounded-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-900">{completedCount}</div>
                        <p className="text-xs text-emerald-600 font-medium mt-1">Total completed trips via FleetPro</p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming / Recent Activity */}
            <div className="grid gap-8 md:grid-cols-2">

                {/* Upcoming Trip Card */}
                <Card className="h-full rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                            <Calendar className="h-5 w-5 text-blue-600" /> Next Trip
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Your next scheduled designated travel</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {nextTrip ? (
                            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 space-y-5">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-black text-lg text-slate-900">Trip #{nextTrip.id}</h4>
                                        <span className="inline-flex mt-2 items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700">
                                            <CheckCircle2 className="w-3 h-3 mr-1.5" /> Approved
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-slate-900">{new Date(nextTrip.startTime).toLocaleDateString()}</div>
                                        <div className="text-xs text-slate-500 font-medium mt-0.5">{new Date(nextTrip.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                        <MapPin className="h-4 w-4 text-slate-400" />
                                        <span>{nextTrip.startLocation} <span className="text-slate-300 mx-2">→</span> {nextTrip.endLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                        <Car className="h-4 w-4 text-slate-400" />
                                        <span>Vehicle: <span className="font-bold text-slate-900">{nextTrip.vehicle ? `${nextTrip.vehicle.make} (${nextTrip.vehicle.licensePlate})` : "Pending Allocation"}</span></span>
                                    </div>
                                </div>

                                <Button variant="outline" className="w-full mt-2 text-xs h-10 font-bold border-slate-200 hover:bg-white hover:text-blue-600 hover:border-blue-200">
                                    View Full Details
                                </Button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
                                <Calendar className="h-8 w-8 text-slate-300 mb-2" />
                                <p className="text-sm text-slate-400 font-medium">No upcoming trips scheduled.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Requests List */}
                <Card className="h-full rounded-2xl border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900">Recent Requests</CardTitle>
                        <CardDescription className="text-slate-500 font-medium">Status of your recent applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {trips.length > 0 ? trips.slice(0, 5).map((trip) => (
                                <div key={trip.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 group-hover:bg-blue-100 transition-colors">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{trip.endLocation}</div>
                                            <div className="text-[10px] text-slate-500 font-mono font-medium mt-0.5">#{trip.id} • {new Date(trip.startTime).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-wide px-2 py-1 rounded-md
                                        ${trip.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                            trip.status === 'APPROVED' || trip.status === 'ASSIGNED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                                        {trip.status}
                                    </span>
                                </div>
                            )) : (
                                <div className="text-center py-10">
                                    <p className="text-sm text-slate-400 font-medium">No requests found.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
