"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Car, Loader2, AlertCircle, TrendingUp, DollarSign, Droplets } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    currentOdometer: number;
}

interface FuelRecord {
    id: number;
    vehicle?: { id: number };
    vehicleId?: number;
    quantity: number;
    cost: number;
    mileage: number;
}

interface VehicleSummary {
    id: number;
    name: string;
    plate: string;
    totalSpent: number;
    totalLiters: number;
    avgCostPerLiter: number;
    consumption: number;
    target: number;
    recordCount: number;
}

export default function VehicleFuelSummaryPage() {
    const [summaries, setSummaries] = useState<VehicleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, fuelRes] = await Promise.all([
                    api.get("/vehicles"),
                    api.get("/fuel")
                ]);

                const vehicles: Vehicle[] = vehiclesRes.data || [];
                const fuelRecords: FuelRecord[] = fuelRes.data || [];

                if (vehicles.length === 0) {
                    setSummaries([]);
                    setLoading(false);
                    return;
                }

                const vehicleStats = vehicles.map(vehicle => {
                    const records = fuelRecords.filter(r => {
                        const vId = r.vehicle?.id || r.vehicleId;
                        return vId === vehicle.id;
                    });

                    const totalSpent = records.reduce((sum, r) => sum + (r.cost || 0), 0);
                    const totalLiters = records.reduce((sum, r) => sum + (r.quantity || 0), 0);
                    const avgCostPerLiter = totalLiters > 0 ? totalSpent / totalLiters : 0;

                    let consumption = 0;
                    if (records.length > 1) {
                        const odometers = records.map(r => r.mileage).filter(m => m > 0).sort((a, b) => a - b);
                        if (odometers.length >= 2) {
                            const distance = odometers[odometers.length - 1] - odometers[0];
                            if (distance > 0) {
                                consumption = (totalLiters / distance) * 100;
                            }
                        }
                    }

                    return {
                        id: vehicle.id,
                        name: `${vehicle.make} ${vehicle.model}`,
                        plate: vehicle.licensePlate,
                        totalSpent: parseFloat(totalSpent.toFixed(2)),
                        totalLiters: parseFloat(totalLiters.toFixed(1)),
                        avgCostPerLiter: parseFloat(avgCostPerLiter.toFixed(2)),
                        consumption: parseFloat(consumption.toFixed(1)) || 0,
                        target: 10.0,
                        recordCount: records.length
                    };
                });

                setSummaries(vehicleStats);
                setError(false);
            } catch (error) {
                console.error("Failed to fetch summary data:", error);
                toast.error("Failed to load vehicle summaries");
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const totalSpent = summaries.reduce((sum, v) => sum + v.totalSpent, 0);
    const totalVolume = summaries.reduce((sum, v) => sum + v.totalLiters, 0);
    const avgConsumption = summaries.length > 0
        ? summaries.reduce((sum, v) => sum + v.consumption, 0) / summaries.filter(v => v.consumption > 0).length
        : 0;

    return (
        <ModuleLayout title="Vehicle Fuel Summary">
            <div className="space-y-6">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <Card className="border-red-200 bg-red-50">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-red-600">
                            <AlertCircle className="h-12 w-12 mb-4" />
                            <p className="text-lg font-semibold">Error loading data</p>
                            <p className="text-sm text-red-500 mt-1">Could not calculate vehicle summaries</p>
                        </CardContent>
                    </Card>
                ) : summaries.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-12 text-slate-500">
                            <Car className="h-16 w-16 mb-4 text-slate-300" />
                            <p className="text-lg font-semibold text-slate-700">No vehicles found</p>
                            <p className="text-sm text-slate-500 mt-1">Add vehicles to see fuel summaries</p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Fleet Spend</p>
                                            <p className="text-3xl font-black text-slate-900 mt-1">${totalSpent.toFixed(2)}</p>
                                            <p className="text-xs text-slate-500 mt-1">{summaries.length} vehicles</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Volume</p>
                                            <p className="text-3xl font-black text-slate-900 mt-1">{totalVolume.toFixed(1)} <span className="text-xl text-slate-500">L</span></p>
                                            <p className="text-xs text-slate-500 mt-1">Across all vehicles</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                                            <Droplets className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Fleet Avg Efficiency</p>
                                            <p className="text-3xl font-black text-slate-900 mt-1">
                                                {avgConsumption > 0 ? avgConsumption.toFixed(1) : 'N/A'}
                                                {avgConsumption > 0 && <span className="text-xl text-slate-500"> L/100km</span>}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">Fleet average</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
                                            <TrendingUp className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {summaries.map((vehicle) => {
                                const isEfficient = vehicle.consumption > 0 && vehicle.consumption <= vehicle.target;
                                const hasData = vehicle.totalLiters > 0;

                                return (
                                    <Card key={vehicle.id} className="hover:shadow-lg transition-shadow border-slate-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg font-black text-slate-900">
                                                        {vehicle.name}
                                                    </CardTitle>
                                                    <p className="text-sm font-mono text-slate-500 mt-1 bg-slate-100 px-2 py-0.5 rounded inline-block">
                                                        {vehicle.plate}
                                                    </p>
                                                </div>
                                                <Car className="h-5 w-5 text-slate-400" />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-slate-600">Avg. Consumption</span>
                                                    <span className={cn(
                                                        "text-lg font-black",
                                                        !hasData ? "text-slate-400" : isEfficient ? "text-green-600" : "text-amber-600"
                                                    )}>
                                                        {hasData ? `${vehicle.consumption} L/100km` : "N/A"}
                                                    </span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs text-slate-500">
                                                        <span>Efficiency Status</span>
                                                        <span className="font-semibold">
                                                            {!hasData ? "No Data" : isEfficient ? "✓ Efficient" : "⚠ Above Target"}
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={!hasData ? 0 : isEfficient ? 85 : 50}
                                                        className={cn("h-2", !hasData ? "bg-slate-100" : isEfficient ? "[&>div]:bg-green-500" : "[&>div]:bg-amber-500")}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total Spent</p>
                                                    <p className="text-xl font-bold text-slate-900">${vehicle.totalSpent}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Total Volume</p>
                                                    <p className="text-xl font-bold text-slate-900">{vehicle.totalLiters}L</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Avg Price/L</p>
                                                    <p className="text-lg font-semibold text-slate-900">
                                                        ${vehicle.avgCostPerLiter.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Fill-ups</p>
                                                    <p className="text-lg font-semibold text-slate-900">{vehicle.recordCount}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </ModuleLayout>
    );
}
