"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Droplets, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";

interface MonthlyData {
    month: string;
    year: number;
    totalLiters: number;
    totalCost: number;
    avgPricePerLiter: number;
    recordCount: number;
    changePercent: number;
}

export default function MonthlyReportsPage() {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [yearSummary, setYearSummary] = useState({
        totalLiters: 0,
        totalCost: 0,
        avgPricePerLiter: 0
    });

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    useEffect(() => {
        fetchMonthlyData();
    }, [selectedYear]);

    const fetchMonthlyData = async () => {
        setLoading(true);
        try {
            const response = await api.get("/fuel");
            const records = response.data;

            // Filter by selected year
            const yearRecords = records.filter((r: any) => {
                const recordYear = new Date(r.date).getFullYear();
                return recordYear === parseInt(selectedYear);
            });

            // Group by month
            const monthlyMap = new Map<number, any[]>();
            yearRecords.forEach((record: any) => {
                const month = new Date(record.date).getMonth();
                if (!monthlyMap.has(month)) {
                    monthlyMap.set(month, []);
                }
                monthlyMap.get(month)!.push(record);
            });

            // Calculate monthly statistics
            const monthlyStats: MonthlyData[] = [];
            let prevMonthLiters = 0;

            for (let i = 0; i < 12; i++) {
                const records = monthlyMap.get(i) || [];
                const totalLiters = records.reduce((sum, r) => sum + r.quantity, 0);
                const totalCost = records.reduce((sum, r) => sum + r.cost, 0);
                const avgPrice = totalLiters > 0 ? totalCost / totalLiters : 0;

                let changePercent = 0;
                if (prevMonthLiters > 0 && totalLiters > 0) {
                    changePercent = ((totalLiters - prevMonthLiters) / prevMonthLiters) * 100;
                }

                if (records.length > 0) {
                    monthlyStats.push({
                        month: monthNames[i],
                        year: parseInt(selectedYear),
                        totalLiters,
                        totalCost,
                        avgPricePerLiter: avgPrice,
                        recordCount: records.length,
                        changePercent
                    });
                    prevMonthLiters = totalLiters;
                }
            }

            // Calculate year summary
            const yearTotal = {
                totalLiters: yearRecords.reduce((sum: number, r: any) => sum + r.quantity, 0),
                totalCost: yearRecords.reduce((sum: number, r: any) => sum + r.cost, 0),
                avgPricePerLiter: 0
            };
            yearTotal.avgPricePerLiter = yearTotal.totalLiters > 0
                ? yearTotal.totalCost / yearTotal.totalLiters
                : 0;

            setMonthlyData(monthlyStats.reverse()); // Most recent first
            setYearSummary(yearTotal);
        } catch (error: any) {
            console.error("Failed to fetch monthly data:", error);
            toast.error(error.response?.data?.message || "Failed to load monthly reports");
        } finally {
            setLoading(false);
        }
    };

    const getTrendIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
        if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
        return <span className="text-slate-400">—</span>;
    };

    const getTrendBadge = (change: number) => {
        if (change === 0) return null;
        const isPositive = change > 0;
        return (
            <Badge variant={isPositive ? "destructive" : "default"} className={isPositive ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}>
                {isPositive ? "+" : ""}{change.toFixed(1)}%
            </Badge>
        );
    };

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

    return (
        <ModuleLayout title="Monthly Fuel Reports">
            <div className="space-y-6">
                {/* Header with Year Selector */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">Monthly Breakdown</h2>
                        <p className="text-slate-500 font-medium">View fuel consumption by month</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-400" />
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(year => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Year Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Fuel ({selectedYear})</CardTitle>
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{yearSummary.totalLiters.toFixed(2)} L</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost ({selectedYear})</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${yearSummary.totalCost.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Price/Liter</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${yearSummary.avgPricePerLiter.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Statistics</CardTitle>
                        <CardDescription>Detailed breakdown of fuel consumption per month</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <LoadingSkeleton type="table" rows={6} />
                        ) : monthlyData.length === 0 ? (
                            <EmptyState
                                icon={Calendar}
                                title={`No data for ${selectedYear}`}
                                description="No fuel records found for the selected year"
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Month</TableHead>
                                        <TableHead className="text-right">Fuel (L)</TableHead>
                                        <TableHead className="text-right">Cost</TableHead>
                                        <TableHead className="text-right">Avg Price/L</TableHead>
                                        <TableHead className="text-right">Records</TableHead>
                                        <TableHead className="text-right">vs Prev Month</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthlyData.map((data, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium">{data.month} {data.year}</TableCell>
                                            <TableCell className="text-right font-mono">{data.totalLiters.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono text-green-600">${data.totalCost.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">${data.avgPricePerLiter.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline">{data.recordCount}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right flex items-center justify-end gap-2">
                                                {getTrendIcon(data.changePercent)}
                                                {getTrendBadge(data.changePercent)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}
