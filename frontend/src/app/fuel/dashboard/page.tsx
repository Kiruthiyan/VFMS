"use client";

import { useEffect, useState } from "react";
import ModuleLayout from "@/components/layout/ModuleLayout";
import Link from "next/link";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import {
    Fuel,
    BarChart3,
    FileText,
    AlertCircle,
    PlusCircle,
    ClipboardList,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Droplets,
    ArrowRight,
    Loader2,
    Activity,
} from "lucide-react";

interface FuelRecord {
    id: number;
    vehicleId: number;
    quantity: number;
    cost: number;
    mileage: number;
    date: string;
    stationName?: string;
}

interface StatCardProps {
    label: string;
    value: string;
    sub: string;
    icon: React.FC<any>;
    color: string;
    trend?: "up" | "down" | "neutral";
}

const StatCard = ({ label, value, sub, icon: Icon, color, trend }: StatCardProps) => (
    <div className={cn("relative rounded-2xl p-5 overflow-hidden border", color)}>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{label}</p>
                <p className="text-3xl font-black leading-none">{value}</p>
                <p className="text-xs opacity-60 mt-1.5 font-medium">{sub}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-sm">
                <Icon className="w-5 h-5" />
            </div>
        </div>
        {trend && (
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-70">
                {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                <span>{trend === "up" ? "Trending up" : trend === "down" ? "Trending down" : "Stable"} this month</span>
            </div>
        )}
    </div>
);

interface QuickLinkProps {
    href: string;
    icon: React.FC<any>;
    title: string;
    description: string;
    badge?: string;
    accent: string;
}

const QuickLink = ({ href, icon: Icon, title, description, badge, accent }: QuickLinkProps) => (
    <Link
        href={href}
        className="group relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
    >
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", accent)}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <p className="font-bold text-slate-900 text-sm">{title}</p>
                {badge && (
                    <span className="text-[9px] font-black uppercase tracking-wide bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-xs text-slate-500 truncate">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
    </Link>
);

export default function FuelDashboardPage() {
    const [records, setRecords] = useState<FuelRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRecords: 0,
        totalCost: 0,
        totalVolume: 0,
        avgCostPerLiter: 0,
        thisMonth: 0,
        lastMonth: 0,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get("/fuel");
                const data: FuelRecord[] = (res.data.content || res.data || []);
                setRecords(data);

                const now = new Date();
                const thisMonth = now.getMonth();
                const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;

                const thisMonthRecs = data.filter(r => new Date(r.date).getMonth() === thisMonth);
                const lastMonthRecs = data.filter(r => new Date(r.date).getMonth() === lastMonth);

                const totalCost = data.reduce((s, r) => s + (r.cost || 0), 0);
                const totalVolume = data.reduce((s, r) => s + (r.quantity || 0), 0);

                setStats({
                    totalRecords: data.length,
                    totalCost,
                    totalVolume,
                    avgCostPerLiter: totalVolume > 0 ? totalCost / totalVolume : 0,
                    thisMonth: thisMonthRecs.reduce((s, r) => s + (r.cost || 0), 0),
                    lastMonth: lastMonthRecs.reduce((s, r) => s + (r.cost || 0), 0),
                });
            } catch {
                toast.error("Failed to load fuel data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const trend: "up" | "down" | "neutral" =
        stats.thisMonth > stats.lastMonth ? "up" : stats.thisMonth < stats.lastMonth ? "down" : "neutral";

    const recentRecords = [...records]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <ModuleLayout title="Fuel Management">
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Header banner */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400 rounded-full -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full translate-y-1/2 -translate-x-1/4" />
                        </div>
                        <div className="relative flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
                                        <Fuel className="w-4 h-4 text-slate-900" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Fleet Fuel Control</span>
                                </div>
                                <h2 className="text-2xl font-black text-white">Fuel Management</h2>
                                <p className="text-slate-400 text-sm mt-1">
                                    {stats.totalRecords} records · ₹{stats.totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })} total spend
                                </p>
                            </div>
                            <Link
                                href="/fuel/entry"
                                className="flex items-center gap-2 bg-amber-400 text-slate-900 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-amber-300 transition-colors shadow-lg"
                            >
                                <PlusCircle className="w-4 h-4" />
                                Add Entry
                            </Link>
                        </div>
                    </div>

                    {/* KPI stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            label="Total Records"
                            value={String(stats.totalRecords)}
                            sub="All time entries"
                            icon={ClipboardList}
                            color="bg-slate-900 text-white border-slate-800"
                        />
                        <StatCard
                            label="Total Spend"
                            value={`₹${(stats.totalCost / 1000).toFixed(1)}k`}
                            sub="Across all vehicles"
                            icon={DollarSign}
                            color="bg-blue-600 text-white border-blue-700"
                            trend={trend}
                        />
                        <StatCard
                            label="Total Volume"
                            value={`${stats.totalVolume.toFixed(0)}L`}
                            sub="Litres dispensed"
                            icon={Droplets}
                            color="bg-emerald-600 text-white border-emerald-700"
                        />
                        <StatCard
                            label="Avg Cost/L"
                            value={`₹${stats.avgCostPerLiter.toFixed(2)}`}
                            sub="Fleet average"
                            icon={TrendingUp}
                            color="bg-amber-500 text-white border-amber-600"
                        />
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
                            Quick Access
                        </h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            <QuickLink
                                href="/fuel"
                                icon={ClipboardList}
                                title="Fuel Records"
                                description="View all fuel entries and history"
                                accent="bg-slate-100 text-slate-600"
                            />
                            <QuickLink
                                href="/fuel/entry"
                                icon={PlusCircle}
                                title="Add Fuel Entry"
                                description="Log a new fuel fill-up"
                                badge="New"
                                accent="bg-amber-100 text-amber-700"
                            />
                            <QuickLink
                                href="/fuel/analytics"
                                icon={BarChart3}
                                title="Analytics"
                                description="Charts, trends and cost breakdowns"
                                accent="bg-blue-100 text-blue-700"
                            />
                            <QuickLink
                                href="/fuel/summary"
                                icon={FileText}
                                title="Summary Report"
                                description="Monthly and per-vehicle summaries"
                                accent="bg-emerald-100 text-emerald-700"
                            />
                            <QuickLink
                                href="/fuel/alerts"
                                icon={AlertCircle}
                                title="Alerts"
                                description="Anomalies, thresholds and warnings"
                                accent="bg-red-100 text-red-600"
                            />
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Recent Entries
                            </h3>
                            <Link href="/fuel" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                                View all <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {recentRecords.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                                <Fuel className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-semibold text-slate-400">No fuel records yet</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Add your first entry to get started.
                                </p>
                                <Link
                                    href="/fuel/entry"
                                    className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" /> Add Fuel Entry
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                {recentRecords.map((r, i) => (
                                    <div
                                        key={r.id}
                                        className={cn(
                                            "flex items-center gap-4 px-5 py-3.5",
                                            i < recentRecords.length - 1 && "border-b border-slate-50"
                                        )}
                                    >
                                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                                            <Fuel className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-800 truncate">
                                                {r.stationName || "Fuel Station"} · Vehicle #{r.vehicleId}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(r.date).toLocaleDateString("en-IN", {
                                                    day: "numeric", month: "short", year: "numeric"
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-black text-slate-900">
                                                ₹{(r.cost || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                            </p>
                                            <p className="text-xs text-slate-400">{r.quantity?.toFixed(1)}L</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ModuleLayout>
    );
}
