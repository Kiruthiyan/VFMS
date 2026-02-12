"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Plus, Search, Filter, Fuel, User, MapPin, Loader2, AlertCircle, FileText } from "lucide-react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import api from "@/lib/api";
import { format } from "date-fns";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
}

interface FuelRecord {
    id: number;
    vehicleId: number;
    driverId: number;
    quantity: number;
    cost: number;
    mileage: number;
    stationName: string;
    receiptPath: string;
    date: string;
}

export default function FuelLogsPage() {
    const [logs, setLogs] = useState<FuelRecord[]>([]);
    const [vehicles, setVehicles] = useState<Record<number, Vehicle>>({});
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fuelRes, vehicleRes] = await Promise.all([
                    api.get("/fuel"),
                    api.get("/vehicles")
                ]);

                setLogs(fuelRes.data);

                // Create a map of vehicle ID to Vehicle object for easy lookup
                const vehicleMap: Record<number, Vehicle> = {};
                vehicleRes.data.forEach((v: Vehicle) => {
                    vehicleMap[v.id] = v;
                });
                setVehicles(vehicleMap);

            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast({
                    variant: "destructive",
                    title: "Error fetching data",
                    description: "Could not load fuel logs."
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [toast]);

    const getVehicleDetails = (id: number) => {
        return vehicles[id] || { make: "Unknown", model: "Vehicle", licensePlate: "N/A" };
    };

    return (
        <ModuleLayout title="Fuel Management">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Fuel Logs</h1>
                        <p className="text-slate-500 mt-1">Monitor fuel consumption and expenses.</p>
                    </div>
                    <Link href="/fuel/entry">
                        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                            <Plus className="mr-2 h-4 w-4" /> Add Fuel Log
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 border-none bg-transparent focus-visible:ring-0"
                        />
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <Button variant="ghost" size="sm" className="text-slate-600">
                        <Filter className="mr-2 h-4 w-4" /> Filter
                    </Button>
                </div>

                {/* Data Table */}
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden min-h-[300px]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center p-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No fuel records found</p>
                            <p className="text-sm">Get started by adding a new fuel log.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[80px]">ID</TableHead>
                                    <TableHead>Vehicle</TableHead>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Mileage</TableHead>
                                    <TableHead>Volume</TableHead>
                                    <TableHead>Cost</TableHead>
                                    <TableHead>Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {logs.map((log) => {
                                    const vehicle = getVehicleDetails(log.vehicleId);
                                    return (
                                        <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                                            <TableCell className="font-mono font-medium text-slate-900">#{log.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Fuel className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="font-medium text-slate-800 text-sm">
                                                        {vehicle.make} {vehicle.model}
                                                        <span className="block text-xs text-slate-500 font-normal">{vehicle.licensePlate}</span>
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {log.stationName || "Unknown"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {format(new Date(log.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-sm">
                                                {log.mileage?.toLocaleString()} km
                                            </TableCell>
                                            <TableCell className="text-slate-900 font-medium">
                                                {log.quantity} L
                                            </TableCell>
                                            <TableCell className="text-slate-900 font-bold">
                                                ${log.cost.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                {log.receiptPath ? (
                                                    <Badge variant="outline" className="text-slate-500 gap-1">
                                                        <FileText className="h-3 w-3" /> Receipt
                                                    </Badge>
                                                ) : (
                                                    <span className="text-xs text-slate-400">No Receipt</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </ModuleLayout>
    );
}
