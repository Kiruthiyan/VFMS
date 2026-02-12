"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, DollarSign, Droplets, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface FuelRecord {
    id: number;
    vehicleId: number;
    quantity: number;
    cost: number;
    mileage: number;
    date: string;
}

export default function FuelAnalyticsPage() {
    const [stats, setStats] = useState({
        totalCost: 0,
        totalVolume: 0,
        avgEfficiency: 0
    });
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get("/fuel");
                const records: FuelRecord[] = response.data;

                const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
                const totalVolume = records.reduce((sum, r) => sum + r.quantity, 0);

                let totalDistance = 0;
                if (records.length > 1) {
                    const sorted = [...records].sort((a, b) => a.mileage - b.mileage);
                    totalDistance = sorted[sorted.length - 1].mileage - sorted[0].mileage;
                }

                const avgEfficiency = totalDistance > 0 ? (totalVolume / totalDistance) * 100 : 0;

                setStats({
                    totalCost,
                    totalVolume,
                    avgEfficiency
                });

                // Prepare Chart Data (Monthly Cost)
                const monthlyData = records.reduce((acc, record) => {
                    const month = new Date(record.date).toLocaleString('default', { month: 'short' });
                    acc[month] = (acc[month] || 0) + record.cost;
                    return acc;
                }, {} as Record<string, number>);

                const chart = Object.keys(monthlyData).map(month => ({
                    name: month,
                    cost: monthlyData[month]
                }));

                setChartData(chart);

            } catch (error) {
                console.error("Failed to fetch analytics:", error);
                toast({
                    variant: "destructive",
                    title: "Error loading analytics",
                    description: "Could not calculate fuel metrics."
                });
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [toast]);

    return (
        <ModuleLayout title="Fuel Analytics Dashboard">
            <div className="space-y-6">

                {/* Alerts Section */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900">Active Alerts</h3>
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>System Notice</AlertTitle>
                        <AlertDescription>
                            Fuel analytics are now running on live data. Ensure vehicle odometers are updated correctly.
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fuel Cost</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">Lifetime expenditure</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                            <Droplets className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <div className="text-2xl font-bold">{stats.totalVolume.toFixed(1)} L</div>
                                    <p className="text-xs text-muted-foreground">Lifetime consumption</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Est. Efficiency</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                <>
                                    <div className="text-2xl font-bold">
                                        {stats.avgEfficiency > 0 ? `${stats.avgEfficiency.toFixed(1)} L/100km` : "N/A"}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-green-600">Based on odometer records</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Area */}
                <Tabs defaultValue="cost" className="w-full">
                    <TabsList>
                        <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
                        <TabsTrigger value="consumption">Consumption Trends</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cost" className="space-y-4">
                        <Card className="h-[350px]">
                            <CardHeader>
                                <CardTitle>Monthly Fuel Costs</CardTitle>
                                <CardDescription>Expenditure over time</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="cost" fill="#2563eb" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="consumption" className="space-y-4">
                        <Card className="h-[350px] flex items-center justify-center bg-slate-50 border-dashed">
                            <p className="text-slate-500">Consumption Details (Coming Soon)</p>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </ModuleLayout>
    );
}
