"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Wrench, Plus, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function MaintenancePage() {
    const { toast } = useToast();
    const [isReportOpen, setIsReportOpen] = useState(false);

    const handleReport = () => {
        toast({ title: "Issue Reported", description: "Maintenance team has been notified." });
        setIsReportOpen(false);
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Maintenance & Repairs</h1>
                    <p className="text-slate-500 mt-1">Track vehicle health and service requests</p>
                </div>
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 font-bold rounded-xl px-6">
                            <Plus className="mr-2 h-4 w-4" /> Report Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Report Vehicle Issue</DialogTitle>
                            <DialogDescription>Describe the problem to initiate a service request.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Vehicle License Plate</label>
                                <Input placeholder="e.g. ABC-1234" className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Issue Type</label>
                                <Select>
                                    <SelectTrigger className="h-11 rounded-xl bg-white text-slate-900 border-slate-200 focus:border-slate-400">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mechanical">Mechanical Failure</SelectItem>
                                        <SelectItem value="electrical">Electrical Issue</SelectItem>
                                        <SelectItem value="tire">Tire / Wheel</SelectItem>
                                        <SelectItem value="body">Body Damage</SelectItem>
                                        <SelectItem value="service">Regular Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Description</label>
                                <Textarea placeholder="Describe the issue in detail..." className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 min-h-[100px] rounded-xl" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleReport} className="bg-slate-900 text-white h-11 w-full rounded-xl font-bold hover:bg-slate-800">Submit Request</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Critical Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">2</div>
                        <p className="text-xs text-slate-500 mt-1">Vehicles off-road</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Scheduled Service</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">5</div>
                        <p className="text-xs text-slate-500 mt-1">Due this week</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Healthy Fleet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">117</div>
                        <p className="text-xs text-slate-500 mt-1">Operational vehicles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Requests List */}
            <h2 className="text-xl font-bold text-slate-900">Active Requests</h2>
            <div className="space-y-4">
                {[
                    { id: 1, vehicle: "Ford F-150 (XYZ-9988)", issue: "Check Engine Light", status: "IN_PROGRESS", date: "Oct 24" },
                    { id: 2, vehicle: "Tesla Model 3 (EV-001)", issue: "Tire Replacement", status: "PENDING", date: "Oct 25" },
                ].map((req) => (
                    <Card key={req.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                    <Wrench className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{req.vehicle}</h4>
                                    <p className="text-sm text-slate-500">{req.issue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right text-sm">
                                    <div className="text-slate-500">{req.date}</div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                    ${req.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {req.status.replace("_", " ")}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
