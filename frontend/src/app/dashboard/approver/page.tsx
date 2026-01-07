"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
    CheckCircle,
    XCircle,
    MapPin,
    Calendar,
    User,
    AlertTriangle,
    Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import api from "@/lib/api";

export default function ApproverDashboardPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get("/trips/status/PENDING");
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch pending requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: "APPROVED" | "REJECTED") => {
        try {
            // Fetch the specific trip first to get full object if needed, or just PATCH
            // assuming existing backend supports full update via PUT.
            // A dedicated PATCH endpoint would be better, but we will use PUT with "APPROVED"/"REJECTED" status

            // First we need the trip details to not overwrite other fields
            const trip = requests.find(r => r.id === id);
            if (!trip) return;

            await api.put(`/trips/${id}`, {
                ...trip,
                status: action
            });

            setRequests(requests.filter(req => req.id !== id));
            toast({
                title: action === "APPROVED" ? "Request Approved" : "Request Rejected",
                description: action === "APPROVED" ? "Notification sent to driver and staff." : "Rejection logged.",
                variant: action === "APPROVED" ? "default" : "destructive",
                className: action === "APPROVED" ? "bg-emerald-50 border-emerald-200 text-emerald-900" : ""
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update request status.",
                variant: "destructive"
            });
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Approvals Dashboard</h1>
                <p className="text-slate-500 font-medium mt-1">Review trip and maintenance requests requiring your attention.</p>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-xl border-slate-200 shadow-sm bg-slate-50/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Pending Requests</CardTitle>
                        <div className="text-3xl font-black mt-1 text-slate-900">{requests.length}</div>
                    </CardHeader>
                </Card>
                <Card className="rounded-xl border-emerald-100 shadow-sm bg-emerald-50/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-emerald-700 uppercase tracking-wider">Approved Today</CardTitle>
                        <div className="text-3xl font-black mt-1 text-emerald-900">-</div> {/* Need backend logic for "Today" */}
                    </CardHeader>
                </Card>
                <Card className="rounded-xl border-red-100 shadow-sm bg-red-50/50">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm font-bold text-red-700 uppercase tracking-wider">Urgent</CardTitle>
                        <div className="text-3xl font-black mt-1 text-red-900">0</div>
                    </CardHeader>
                </Card>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Pending Actions</h2>

                {requests.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <CheckCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
                        <p className="text-slate-500 font-medium mt-1">No pending requests at this time.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {requests.map((req) => (
                            <Card key={req.id} className="overflow-hidden hover:shadow-lg transition-all rounded-2xl border-slate-200">
                                <CardContent className="p-0">
                                    <div className="flex flex-col md:flex-row">
                                        {/* Left Info Strip */}
                                        <div className="bg-slate-50/80 p-6 flex flex-col justify-center min-w-[240px] border-b md:border-b-0 md:border-r border-slate-100">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-lg">
                                                    {req.requester?.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{req.requester?.name || "Unknown User"}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{req.requester?.role || "STAFF"}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mt-2 bg-white px-2 py-1 rounded border border-slate-200 inline-block w-fit">
                                                Req #{req.id}
                                            </div>
                                        </div>

                                        {/* Main Content */}
                                        <div className="p-6 flex-1 grid md:grid-cols-2 gap-6 items-center">
                                            <div className="space-y-4">
                                                <div className="flex items-start gap-4">
                                                    <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Route</div>
                                                        <div className="font-bold text-slate-900 text-lg leading-tight">
                                                            {req.startLocation} <span className="text-slate-300 mx-1">→</span> {req.endLocation}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-4">
                                                    <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                                                    <div>
                                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Schedule</div>
                                                        <div className="font-bold text-slate-900">{new Date(req.startTime).toLocaleDateString()}</div>
                                                        <div className="text-xs text-slate-500 font-medium">
                                                            {new Date(req.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(req.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="p-6 bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-center gap-3 min-w-[200px]">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-500/20 rounded-xl h-11">Approve</Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-2xl border-0 shadow-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-2xl font-black text-slate-900">Confirm Approval</DialogTitle>
                                                        <DialogDescription className="text-slate-500 font-medium">
                                                            This will authorize Trip #{req.id} for {req.requester?.name}.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <DialogFooter className="pt-4">
                                                        <Button onClick={() => handleAction(req.id, "APPROVED")} className="bg-emerald-600 hover:bg-emerald-700 font-bold px-8 rounded-xl h-11">Confirm & Approve</Button>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>

                                            <Button variant="ghost" className="w-full text-slate-400 hover:text-red-600 hover:bg-red-50 font-bold rounded-xl h-11" onClick={() => handleAction(req.id, "REJECTED")}>
                                                Reject Request
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
