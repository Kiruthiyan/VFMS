"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Fuel, Droplets, Banknote, Calendar } from "lucide-react";

export default function FuelPage() {
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Mock Data
    const logs = [
        { id: 1, vehicle: "Toyota Camry (ABC-1234)", date: "2024-10-24", quantity: "45L", cost: "$65.00", driver: "John Doe" },
        { id: 2, vehicle: "Ford F-150 (XYZ-9988)", date: "2024-10-23", quantity: "80L", cost: "$110.00", driver: "Mike Smith" },
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Fuel Management</h1>
                    <p className="text-slate-500 mt-1">Track fuel consumption and expenses</p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Fuel Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Log Fuel Purchase</DialogTitle>
                            <DialogDescription>Enter details from the fuel receipt.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Vehicle License Plate</label>
                                <Input placeholder="e.g. ABC-1234" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Quantity (L)</label>
                                    <Input type="number" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Total Cost ($)</label>
                                    <Input type="number" placeholder="0.00" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Odometer Reading</label>
                                <Input type="number" placeholder="123456" />
                            </div>
                            {/* File Upload Placeholder */}
                            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center text-sm text-slate-500">
                                Upload Receipt Image
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setIsAddOpen(false)}>Save Log</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Spent (Oct)</CardTitle>
                        <Banknote className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">$4,250</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Volume</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">3,120 L</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Avg Efficiency</CardTitle>
                        <Fuel className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">10.5 L/100km</div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Logs</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-left text-sm">
                        <thead className="border-b">
                            <tr>
                                <th className="pb-3 font-semibold text-slate-600">Vehicle</th>
                                <th className="pb-3 font-semibold text-slate-600">Date</th>
                                <th className="pb-3 font-semibold text-slate-600">Quantity</th>
                                <th className="pb-3 font-semibold text-slate-600">Cost</th>
                                <th className="pb-3 font-semibold text-slate-600">Driver</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td className="py-3 font-medium">{log.vehicle}</td>
                                    <td className="py-3 text-slate-500">{log.date}</td>
                                    <td className="py-3">{log.quantity}</td>
                                    <td className="py-3 font-medium text-green-700">{log.cost}</td>
                                    <td className="py-3 text-slate-500">{log.driver}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
