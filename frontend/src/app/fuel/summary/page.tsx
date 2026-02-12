"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Car, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    currentOdometer: number;
}

interface FuelRecord {
    id: number;
    vehicle: { id: number };
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
    consumption: number; // L/100km
    target: number; // Mock target for comparison
}

export default function VehicleFuelSummaryPage() {
    const [summaries, setSummaries] = useState<VehicleSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vehiclesRes, fuelRes] = await Promise.all([
                    api.get("/vehicles"),
                    api.get("/fuel")
                ]);

                const vehicles: Vehicle[] = vehiclesRes.data;
                const fuelRecords: FuelRecord[] = fuelRes.data;

                const vehicleStats = vehicles.map(vehicle => {
                    const records = fuelRecords.filter(r => r.vehicle.id === vehicle.id);

                    const totalSpent = records.reduce((sum, r) => sum + r.cost, 0);
                    const totalLiters = records.reduce((sum, r) => sum + r.quantity, 0);

                    // Calculate Consumption (L/100km)
                    // Logic: (Total Liters / Distance) * 100
                    // Distance = Max Odometer - Min Odometer
                    let consumption = 0;
                    if (records.length > 1) {
                        const odometers = records.map(r => r.mileage).sort((a, b) => a - b);
                        const distance = odometers[odometers.length - 1] - odometers[0];
                        if (distance > 0) {
                            // Exclude the last fill-up quantity from consumption calc strictly speaking? 
                            // Simplified: Use total liters over total distance for rough estimate
                            consumption = (totalLiters / distance) * 100;
                        }
                    }

                    return {
                        id: vehicle.id,
                        name: `${vehicle.make} ${vehicle.model}`,
                        plate: vehicle.licensePlate,
                        totalSpent: parseFloat(totalSpent.toFixed(2)),
                        totalLiters: parseFloat(totalLiters.toFixed(1)),
                        consumption: parseFloat(consumption.toFixed(1)) || 0,
                        target: 10.0 // Default target
                    };
                });

                setSummaries(vehicleStats);
            } catch (error) {
                console.error("Failed to fetch summary data:", error);
                toast({
                    variant: "destructive",
                    title: "Error loading data",
                    description: "Could not calculate vehicle summaries."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [toast]);

    return (
        <ModuleLayout title="Vehicle Fuel Summary">
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            ) : summaries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border shadow-sm">
                    <AlertCircle className="h-10 w-10 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No vehicles found</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {summaries.map((vehicle) => {
                        const isEfficient = vehicle.consumption > 0 && vehicle.consumption <= vehicle.target;
                        const hasData = vehicle.totalLiters > 0;

                        return (
                            <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-slate-600">
                                        {vehicle.plate}
                                    </CardTitle>
                                    <Car className="h-4 w-4 text-slate-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-slate-900">{vehicle.name}</div>
                                    <div className="mt-4 space-y-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Avg. Consumption</span>
                                            <span className={cn(
                                                "font-bold",
                                                !hasData ? "text-slate-400" : isEfficient ? "text-green-600" : "text-red-600"
                                            )}>
                                                {hasData ? `${vehicle.consumption} L/100km` : "N/A"}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>Efficiency Score</span>
                                                <span>{!hasData ? "No Data" : isEfficient ? "Good" : "Needs Check"}</span>
                                            </div>
                                            <Progress
                                                value={!hasData ? 0 : isEfficient ? 85 : 45}
                                                className={cn("h-2", !hasData ? "bg-slate-100" : isEfficient ? "bg-green-100" : "bg-red-100")}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                            <div>
                                                <p className="text-xs text-slate-500">Total Spent</p>
                                                <p className="text-lg font-semibold">${vehicle.totalSpent}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Total Volume</p>
                                                <p className="text-lg font-semibold">{vehicle.totalLiters} L</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </ModuleLayout>
    );
}


