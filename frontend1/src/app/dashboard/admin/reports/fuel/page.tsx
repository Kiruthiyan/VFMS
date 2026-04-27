"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
    Fuel, 
    TrendingUp, 
    BarChart3, 
    Navigation, 
    Droplets, 
    DollarSign,
    MapPin,
    Calendar,
    Download,
    Search,
    ChevronUp
} from "lucide-react";
import { reportService } from "@/services/reportService";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, PieChart, Pie, Cell, ComposedChart
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FuelAnalysisPage() {
    const [fuelLogs, setFuelLogs] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterText, setFilterText] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);

    const filteredLogs = fuelLogs.filter(log => {
        const matchesText = (log.licensePlate || '').toLowerCase().includes(filterText.toLowerCase()) ||
                          (log.fuelStation || '').toLowerCase().includes(filterText.toLowerCase());
        
        const logDate = new Date(log.date);
        const matchesStart = !startDate || logDate >= new Date(startDate);
        const matchesEnd = !endDate || logDate <= new Date(endDate);
        
        return matchesText && matchesStart && matchesEnd;
    });

    useEffect(() => {
        const loadPageData = async () => {
            try {
                const [logs, vehicleData] = await Promise.all([
                    reportService.getFuelLogs(),
                    reportService.getVehicles()
                ]);
                setFuelLogs(logs);
                setVehicles(vehicleData);
            } catch (error) {
                console.error('Failed to load fuel analytics:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPageData();
    }, []);

    if (loading) return <div className="p-8">Loading fuel analytics...</div>;

    // --- Analytics Processing ---

    // 1. Calculations
    const totalCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
    const totalV = fuelLogs.reduce((sum, log) => sum + (log.fuelQuantity || 0), 0);
    const avgPrice = totalV > 0 ? totalCost / totalV : 0;
    
    // Efficiency (Mocked logic for demo)
    const totalDistance = vehicles.reduce((sum, v) => sum + (v.totalDistance || 0), 0);
    const avgEfficiency = totalV > 0 ? totalDistance / totalV : 0;

    // 2. Trajectory Data (Group by Date)
    const trajectoryData = fuelLogs.reduce((acc: any[], log) => {
        const date = new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const existing = acc.find(a => a.name === date);
        if (existing) {
            existing.cost += log.totalCost;
            existing.liters += log.fuelQuantity;
        } else {
            acc.push({ name: date, cost: log.totalCost, liters: log.fuelQuantity });
        }
        return acc;
    }, []).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    // 3. Departmental Spend
    const deptSpend = fuelLogs.reduce((acc: any, log) => {
        const vehicle = vehicles.find(v => v.licensePlate === log.licensePlate);
        const dept = vehicle ? vehicle.department : 'Unknown';
        acc[dept] = (acc[dept] || 0) + log.totalCost;
        return acc;
    }, {});
    const deptChartData = Object.entries(deptSpend).map(([name, value]) => ({ name, value }));

    // 4. Station distribution
    const stationData = fuelLogs.reduce((acc: any, log) => {
        acc[log.fuelStation] = (acc[log.fuelStation] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(stationData).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6 p-8 bg-slate-50/50 min-h-screen animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <Fuel className="w-8 h-8 text-amber-500" />
                        Fuel Analysis Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">Operational intelligence on fuel consumption, costs, and fleet efficiency</p>
                </div>
                <div className="relative">
                    <button 
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg ${
                            showDatePicker || startDate || endDate 
                            ? 'bg-amber-500 text-slate-900 border-amber-600' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {startDate && endDate ? `${startDate} to ${endDate}` : 'Select Period'}
                    </button>

                    {showDatePicker && (
                        <div className="absolute right-0 mt-2 p-4 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 w-72 animate-in slide-in-from-top-2 duration-200">
                             <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                                    <input 
                                        type="date" 
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                                    <input 
                                        type="date" 
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button 
                                        onClick={() => {setStartDate(""); setEndDate(""); setShowDatePicker(false);}}
                                        className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        RESET
                                    </button>
                                    <button 
                                        onClick={() => setShowDatePicker(false)}
                                        className="flex-1 py-2 bg-slate-900 text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors"
                                    >
                                        APPLY
                                    </button>
                                </div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Top KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Expenditure', value: `$${(totalCost || 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50', sub: '+ $450 vs last month' },
                    { label: 'Consumption Volume', value: `${(totalV || 0).toLocaleString()} L`, icon: Droplets, color: 'text-amber-600', bg: 'bg-amber-50', sub: '92% of tank capacity' },
                    { label: 'Avg Efficiency', value: `${(avgEfficiency || 0).toFixed(1)} km/L`, icon: Navigation, color: 'text-green-600', bg: 'bg-green-50', sub: '↑ 2.1% improvement' },
                    { label: 'Avg Price/L', value: `$${(avgPrice || 0).toFixed(2)}`, icon: Fuel, color: 'text-purple-600', bg: 'bg-purple-50', sub: 'Current market rate' },
                ].map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm group hover:shadow-md transition-all">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-3xl font-black text-slate-900 mt-2">{stat.value}</h3>
                                    <p className={`text-[10px] font-bold mt-2 ${stat.color}`}>{stat.sub}</p>
                                </div>
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Spend & Volume Trajectory */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Consumption & Cost Trajectory</CardTitle>
                        <CardDescription>Daily breakdown of fuel volume vs expenditure</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={trajectoryData}>
                                <defs>
                                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Area yAxisId="left" type="monotone" dataKey="cost" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} name="Total Cost ($)" />
                                <Bar yAxisId="right" dataKey="liters" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Consumption (L)" barSize={25} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Station Distribution Pie */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Vendor Preference</CardTitle>
                        <CardDescription>Distribution of fuel stations used</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px] flex flex-col justify-center items-center">
                        <ResponsiveContainer width="100%" height="250px">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="grid grid-cols-2 gap-4 mt-6 w-full px-4">
                            {pieData.map((item, index) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase truncate">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Department Spend Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Departmental Fuel Allocation</CardTitle>
                        <CardDescription>Fuel costs distributed by organizational cost center</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deptChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30} name="Total Spend" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-slate-900 text-white">
                    <CardHeader>
                        <CardTitle className="text-white">Efficiency Analysis</CardTitle>
                        <CardDescription className="text-slate-400">Monthly insight on fleet utilization</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl">
                                    <BarChart3 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Most Efficient Departmemt</p>
                                    <p className="text-xs text-slate-400">Logistics - 9.2 km/L</p>
                                </div>
                            </div>
                            <ChevronUp className="w-5 h-5 text-green-400" />
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl">
                                    <Navigation className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Optimal Fuel Route</p>
                                    <p className="text-xs text-slate-400">Main Hub to Highway Junction</p>
                                </div>
                            </div>
                            <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        </div>
                        <button 
                            onClick={() => alert("Leaderboard analysis is being calculated based on current fleet deployment...")}
                            className="w-full py-3 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                        >
                           View Efficiency Leaderboard
                        </button>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Table */}
            <Card className="border-none shadow-sm overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-6">
                    <div>
                        <CardTitle>Fuel Log Registry</CardTitle>
                        <CardDescription>Detailed audit of every fuel transaction recorded</CardDescription>
                    </div>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Filter by vehicle or station..." 
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Vehicle Identity</th>
                                    <th className="px-6 py-4">Transaction Date</th>
                                    <th className="px-6 py-4">Quantity (L)</th>
                                    <th className="px-6 py-4">Price/L</th>
                                    <th className="px-6 py-4">Total Cost</th>
                                    <th className="px-6 py-4">Odometer</th>
                                    <th className="px-6 py-4">Fuel Station</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                                                    V
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{log.licensePlate}</p>
                                                    <p className="text-[10px] text-slate-400 uppercase font-bold">ID: {log.vehicleId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-medium">{log.date}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{log.fuelQuantity}</td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">${log.pricePerLiter}</td>
                                        <td className="px-6 py-4">
                                            <Badge className="bg-slate-100 text-slate-900 hover:bg-slate-100 border-none px-2 py-0.5 font-black">
                                                ${log.totalCost}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{(log.odometer || 0).toLocaleString()} km</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <MapPin className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="font-medium">{log.fuelStation}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ArrowUpRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  )
}
