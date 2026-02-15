"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Car, Fuel, DollarSign, TrendingUp, Loader2, Calendar } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
}

interface VehicleStats {
    totalFuel: number;
    totalCost: number;
    avgEfficiency: number;
    recordCount: number;
    firstFill: string;
    lastFill: string;
    avgCostPerLiter: number;
}

export default function ByVehicleReportsPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [stats, setStats] = useState<VehicleStats | null>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVehicles();
    }, []);

    useEffect(() => {
        if (selectedVehicle) {
            fetchVehicleData();
        }
    }, [selectedVehicle]);

    const fetchVehicles = async () => {
        try {
            const response = await api.get("/vehicles");
            setVehicles(response.data);
            if (response.data.length > 0) {
                setSelectedVehicle(response.data[0].id.toString());
            }
        } catch (error: any) {
            console.error("Failed to fetch vehicles:", error);
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    const fetchVehicleData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/fuel");
            const allRecords = response.data;

            // Filter records for selected vehicle
            const vehicleRecords = allRecords.filter((r: any) =>
                r.vehicle?.id === parseInt(selectedVehicle) || r.vehicleId === parseInt(selectedVehicle)
            );

            if (vehicleRecords.length === 0) {
                setStats(null);
                setChartData([]);
                setLoading(false);
                return;
            }

            // Calculate statistics
            const totalFuel = vehicleRecords.reduce((sum: number, r: any) => sum + r.quantity, 0);
            const totalCost = vehicleRecords.reduce((sum: number, r: any) => sum + r.cost, 0);

            // Calculate efficiency (km/L)
            const sortedByMileage = [...vehicleRecords].sort((a: any, b: any) => a.mileage - b.mileage);
            const totalDistance = sortedByMileage[sortedByMileage.length - 1].mileage - sortedByMileage[0].mileage;
            const avgEfficiency = totalFuel > 0 ? totalDistance / totalFuel : 0;

            // Sort by date
            const sortedByDate = [...vehicleRecords].sort((a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

            setStats({
                totalFuel,
                totalCost,
                avgEfficiency,
                recordCount: vehicleRecords.length,
                firstFill: sortedByDate[0].date,
                lastFill: sortedByDate[sortedByDate.length - 1].date,
                avgCostPerLiter: totalFuel > 0 ? totalCost / totalFuel : 0
            });

            // Prepare chart data (last 10 fills)
            const recentFills = sortedByDate.slice(-10).map((r: any) => ({
                date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                liters: r.quantity,
                cost: r.cost,
                efficiency: r.mileage // You can calculate efficiency between fills if needed
            }));

            setChartData(recentFills);
        } catch (error: any) {
            console.error("Failed to fetch vehicle data:", error);
            toast.error("Failed to load vehicle statistics");
        } finally {
            setLoading(false);
        }
    };

    const selectedVehicleData = vehicles.find(v => v.id.toString() === selectedVehicle);

    return (
        <ModuleLayout title="Per-Vehicle Fuel Reports">
            <div className="space-y-6">
                {/* Header with Vehicle Selector */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Vehicle Consumption Analysis</h2>
                        <p className="text-slate-500 font-medium">Detailed fuel statistics per vehicle</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-slate-400" />
                        <Select value={selectedVehicle} onValueChange={setSelectedVehicle} disabled={vehicles.length === 0}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Select vehicle..." />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles.map(vehicle => (
                                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                        {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <LoadingSkeleton type="card" rows={6} />
                ) : !stats ? (
                    <EmptyState
                        icon={Fuel}
                        title="No fuel data"
                        description={`No fuel records found for ${selectedVehicleData?.licensePlate || "this vehicle"}`}
                    />
                ) : (
                    <>
                        {/* Vehicle Info Card */}
                        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-blue-900">
                                            {selectedVehicleData?.make} {selectedVehicleData?.model}
                                        </h3>
                                        <p className="text-blue-700 font-semibold mt-1">{selectedVehicleData?.licensePlate}</p>
                                    </div>
                                    <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                                        {stats.recordCount} Refills
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Statistics Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Fuel</CardTitle>
                                    <Fuel className="h-4 w-4 text-blue-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.totalFuel.toFixed(2)} L</div>
                                    <p className="text-xs text-slate-500 mt-1">Across {stats.recordCount} refills</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                                    <DollarSign className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                                    <p className="text-xs text-slate-500 mt-1">Avg ${stats.avgCostPerLiter.toFixed(2)}/L</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Fuel Efficiency</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stats.avgEfficiency.toFixed(2)} km/L</div>
                                    <p className="text-xs text-slate-500 mt-1">Average efficiency</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Period</CardTitle>
                                    <Calendar className="h-4 w-4 text-purple-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm font-medium">
                                        {new Date(stats.firstFill).toLocaleDateString()}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        to {new Date(stats.lastFill).toLocaleDateString()}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fuel Consumption Trend</CardTitle>
                                    <CardDescription>Last 10 refills</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="liters" fill="#3b82f6" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Cost Trend</CardTitle>
                                    <CardDescription>Last 10 refills</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={2} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </ModuleLayout>
    );
}
