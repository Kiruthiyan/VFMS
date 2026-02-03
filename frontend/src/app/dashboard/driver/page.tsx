"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    MapPin,
    Navigation,
    Clock,
    CheckCircle2,
    Calendar,
    Fuel,
    Loader2
} from "lucide-react";
import api from "@/lib/api";
import { authService } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";

export default function DriverDashboardPage() {
    const [isAvailable, setIsAvailable] = useState(true);
    const [currentTrip, setCurrentTrip] = useState<any>(null);
    const [upcomingTrips, setUpcomingTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Completion Logic
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [completionData, setCompletionData] = useState({ endOdometer: "", fuelConsumed: "", notes: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = authService.getUser();
    const { toast } = useToast();

    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/trips/driver/${user.id}`);
            const trips = response.data;

            const active = trips.find((t: any) => t.status === "STARTED" || t.status === "ASSIGNED");
            const others = trips.filter((t: any) => t.id !== active?.id && t.status !== "COMPLETED" && t.status !== "CANCELLED");

            setCurrentTrip(active || null);
            setUpcomingTrips(others);
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartTrip = async () => {
        if (!currentTrip) return;
        setIsSubmitting(true);
        try {
            await api.post(`/trips/${currentTrip.id}/start`);
            toast({ title: "Trip Started", description: "Safe driving! Trip status has been updated." });
            fetchTrips();
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to start trip", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCompleteTrip = async () => {
        if (!currentTrip) return;
        setIsSubmitting(true);
        try {
            // Basic validation
            if (!completionData.endOdometer) {
                toast({ title: "Error", description: "Odometer reading is required", variant: "destructive" });
                setIsSubmitting(false);
                return;
            }

            await api.post(`/trips/${currentTrip.id}/complete`, {
                endOdometer: parseFloat(completionData.endOdometer),
                fuelConsumed: completionData.fuelConsumed ? parseFloat(completionData.fuelConsumed) : 0,
                notes: completionData.notes
            });

            toast({ title: "Trip Completed", description: "Trip log has been submitted successfully." });
            setIsCompleteOpen(false);
            setCompletionData({ endOdometer: "", fuelConsumed: "", notes: "" });
            fetchTrips();
        } catch (e: any) {
            toast({ title: "Error", description: e.response?.data?.message || "Failed to complete trip", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Availability */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Portal</h1>
                    <p className="text-slate-500 font-medium">Welcome Back, {user?.name || "Driver"}</p>
                </div>
                {/* Availability switch logic can be wired up later */}
                <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                    <span className="text-sm font-bold text-slate-700">Set Availability:</span>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-black tracking-wide ${!isAvailable ? 'text-slate-400' : 'text-emerald-600'}`}>
                            {isAvailable ? "AVAILABLE" : "OFF DUTY"}
                        </span>
                        <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Main Action Card */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Current Assignment</h2>

                    {currentTrip ? (
                        <Card className="border-blue-100 shadow-lg shadow-blue-500/5 overflow-hidden rounded-2xl">
                            <div className={`h-2 w-full ${currentTrip.status === 'STARTED' ? 'bg-emerald-500' : 'bg-blue-600'}`} />
                            <CardHeader className="bg-white">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <Badge className={`${currentTrip.status === 'STARTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} mb-2 font-bold`}>
                                            {currentTrip.status}
                                        </Badge>
                                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Trip ID #{currentTrip.id}</div>
                                        <CardTitle className="text-2xl text-slate-900">
                                            {currentTrip.startLocation} <span className="text-slate-300">→</span> {currentTrip.endLocation}
                                        </CardTitle>
                                        <CardDescription className="font-medium mt-1">
                                            Scheduled: {new Date(currentTrip.startTime).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicle</div>
                                        <div className="font-bold text-slate-900 text-lg">{currentTrip.vehicle?.make} {currentTrip.vehicle?.model}</div>
                                        <div className="text-xs bg-slate-100 px-2 py-1 rounded-md inline-block mt-1 font-mono text-slate-600 border border-slate-200">
                                            {currentTrip.vehicle?.licensePlate || "N/A"}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-8 p-8">
                                <div className="flex flex-col gap-6 relative pl-6 border-l-2 border-slate-100 ml-2">
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full bg-white border-4 border-slate-300" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pick Up</h4>
                                        <p className="text-lg font-bold text-slate-900 mt-1">{currentTrip.startLocation}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[29px] top-1.5 h-4 w-4 rounded-full bg-blue-600 shadow-lg shadow-blue-500/30 border-4 border-white" />
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Destination</h4>
                                        <p className="text-lg font-bold text-slate-900 mt-1">{currentTrip.endLocation}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-100/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-400 shadow-sm">
                                            <Fuel className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Odometer Start</div>
                                            <div className="text-sm font-bold text-slate-700">{currentTrip.startOdometer ? `${currentTrip.startOdometer} km` : `${currentTrip.vehicle?.currentOdometer || 0} km`}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-400 shadow-sm">
                                            <Navigation className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Distance Est.</div>
                                            <div className="text-sm font-bold text-slate-700">{currentTrip.distance || "N/A"}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
                                {currentTrip.status !== "STARTED" ? (
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 rounded-xl transition-all hover:scale-[1.01]"
                                        onClick={handleStartTrip}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Navigation className="mr-2 h-5 w-5" />}
                                        Start Trip
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full h-14 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 rounded-xl transition-all hover:scale-[1.01]"
                                        onClick={() => setIsCompleteOpen(true)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                                        Complete Trip
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                            <CardContent className="flex flex-col items-center justify-center h-64">
                                <CheckCircle2 className="h-12 w-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900">All Caught Up</h3>
                                <p className="text-slate-500 font-medium">No trips currently assigned to you.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900">Next Up</h2>
                    {upcomingTrips.length > 0 ? upcomingTrips.map((trip) => (
                        <Card key={trip.id} className="hover:bg-slate-50/80 transition-all cursor-pointer border-slate-200 shadow-sm hover:shadow-md rounded-xl group">
                            <CardContent className="p-5">
                                <div className="flex gap-4 mb-3">
                                    <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xs flex-col border border-indigo-100 group-hover:bg-indigo-100 transition-colors">
                                        <Calendar className="h-5 w-5 mb-0.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 truncate">{trip.endLocation}</h4>
                                        <p className="text-xs text-slate-500 font-medium truncate">From: {trip.startLocation}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <Clock className="h-3 w-3" /> {new Date(trip.startTime).toLocaleString()}
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-sm text-slate-400 font-medium">No upcoming trips scheduled.</p>
                        </div>
                    )}
                    <Button variant="outline" className="w-full font-bold border-slate-200 text-slate-600 hover:bg-slate-50 h-11 rounded-xl">View Schedule History</Button>
                </div>
            </div>

            {/* Trip Completion Dialog */}
            <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl border-0 shadow-2xl">
                    <DialogHeader className="space-y-3 pb-4 border-b border-slate-100">
                        <DialogTitle className="text-2xl font-black text-slate-900">Trip Completion Log</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Please record final trip details to close this assignment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Ending Odometer (km)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 15420"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
                                value={completionData.endOdometer}
                                onChange={(e) => setCompletionData({ ...completionData, endOdometer: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Fuel Consumed (Optional - Liters)</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 12.5"
                                className="h-12 bg-slate-50 border-slate-200 focus:bg-white rounded-xl"
                                value={completionData.fuelConsumed}
                                onChange={(e) => setCompletionData({ ...completionData, fuelConsumed: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Trip Notes / Issues</Label>
                            <Textarea
                                placeholder="Any maintenance issues or incidents?"
                                className="h-24 bg-slate-50 border-slate-200 focus:bg-white rounded-xl resize-none"
                                value={completionData.notes}
                                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter className="pt-4">
                        <div className="flex gap-3 w-full">
                            <Button variant="ghost" onClick={() => setIsCompleteOpen(false)} className="flex-1 rounded-xl font-bold h-12">Cancel</Button>
                            <Button disabled={isSubmitting} onClick={handleCompleteTrip} className="flex-[2] rounded-xl font-bold h-12 bg-slate-900 text-white shadow-xl">
                                {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                Submit & Finish
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
