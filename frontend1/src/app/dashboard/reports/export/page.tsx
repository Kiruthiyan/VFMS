"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Table, BarChart, Car, User, Droplet, Wrench, Calendar, ClipboardList, TrendingUp } from "lucide-react";
import { exportService } from "@/services/exportService";
import { reportService } from "@/services/reportService";
import { useToast } from "@/hooks/use-toast";

export default function ExportPage() {
    const { toast } = useToast();
    const [downloading, setDownloading] = useState<string | null>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [drivers, setDrivers] = useState<any[]>([]);
    
    // Selection states
    const [selectedVehicle, setSelectedVehicle] = useState<string>('');
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    const [selectedFuelVehicle, setSelectedFuelVehicle] = useState<string>('');
    const [selectedMaintenanceVehicle, setSelectedMaintenanceVehicle] = useState<string>('');
    const [selectedRental, setSelectedRental] = useState<string>('');

    // Month/Year filter for category reports
    const [selectedMonth, setSelectedMonth] = useState<string>('all');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    useEffect(() => {
        const loadData = async () => {
            try {
                const [vData, dData] = await Promise.all([
                    reportService.getVehicles(),
                    reportService.getDriverPerformance()
                ]);
                setVehicles(vData);
                setDrivers(dData);
                
                if (vData.length > 0) {
                    const firstId = vData[0].id || vData[0].vehicleId;
                    setSelectedVehicle(firstId);
                    setSelectedFuelVehicle(firstId);
                    setSelectedMaintenanceVehicle(firstId);
                }
                if (dData.length > 0) {
                    setSelectedDriver(dData[0].id || dData[0].driverId);
                }
            } catch (e) {
                console.error("Export page data load failed", e);
            }
        };
        loadData();
    }, []);

    const getDateRange = () => {
        if (selectedMonth === 'all') return { startDate: undefined, endDate: undefined };

        const monthIndex = parseInt(selectedMonth);
        const startDate = new Date(selectedYear, monthIndex, 1);
        const endDate = new Date(selectedYear, monthIndex + 1, 0);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    const handleExport = async (type: string, format: 'pdf' | 'excel', id?: string) => {
        const loadingId = `${type}-${format}`;
        setDownloading(loadingId);
        
        try {
            const { startDate, endDate } = getDateRange();

            // Overall Summary
            if (type === 'overall') {
                const summary = await reportService.getDashboardStats();
                if (format === 'pdf') exportService.exportOverallSummaryPDF(summary);
                else exportService.exportOverallSummaryExcel(summary);
            }
            // Individual Vehicle
            else if (type === 'vehicle') {
                const vehicleId = id || selectedVehicle;
                const vehicle = vehicles.find(v => (v.id || v.vehicleId).toString() === vehicleId.toString());
                if (format === 'pdf') exportService.exportVehicleReportPDF(vehicle);
                else exportService.exportVehicleReportExcel(vehicle);
            }
            // Individual Driver
            else if (type === 'driver') {
                const driverId = id || selectedDriver;
                const driver = drivers.find(d => (d.id || d.driverId).toString() === driverId.toString());
                if (format === 'pdf') exportService.exportDriverReportPDF(driver);
                else exportService.exportDriverReportExcel(driver);
            }
            // Category Reports
            else if (type === 'maintenance') {
                const data = await reportService.getMaintenanceAnalytics();
                if (format === 'pdf') exportService.exportMaintenancePDF(data, startDate, endDate);
                else exportService.exportMaintenanceExcel(data);
            }
            else if (type === 'fuel') {
                const data = await reportService.getFuelLogs();
                if (format === 'pdf') exportService.exportFuelPDF(data, startDate, endDate);
                else exportService.exportFuelExcel(data);
            }
            // Fuel Log for specific vehicle
            else if (type === 'fuellog') {
                const data = await reportService.getFuelLogs();
                const vehicleId = id || selectedFuelVehicle;
                const filtered = data.filter((f: any) => (f.vehicleId || '').toString() === vehicleId.toString());
                if (format === 'pdf') exportService.exportFuelPDF(filtered);
                else exportService.exportFuelExcel(filtered);
            }
            // Maintenance Log for specific vehicle
            else if (type === 'maintenancelog') {
                const data = await reportService.getMaintenanceAnalytics();
                const vehicleId = id || selectedMaintenanceVehicle;
                const filtered = data.filter((m: any) => (m.vehicleId || m.licensePlate || '').toString() === vehicleId.toString());
                if (format === 'pdf') exportService.exportMaintenancePDF(filtered);
                else exportService.exportMaintenanceExcel(filtered);
            }
            // Rental
            else if (type === 'rental') {
                const data = await reportService.getRentals();
                if (format === 'pdf') exportService.exportRentalPDF(data);
                else exportService.exportRentalExcel(data);
            }

            toast({
                title: "Export Successful",
                description: `Your ${type} ${format.toUpperCase()} report has been downloaded.`,
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export Failed",
                description: "There was a problem generating your report.",
                variant: "destructive",
            });
        } finally {
            setDownloading(null);
        }
    };

    const categoryReports = [
        { id: 'maintenance', title: 'Maintenance Costs', description: 'Overall maintenance expenses and trends.', icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-50' },
        { id: 'fuel', title: 'Fuel Analysis', description: 'Overall fuel consumption and efficiency.', icon: Droplet, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'rental', title: 'Rental Activity', description: 'Monthly rental bookings and revenue.', icon: Calendar, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'utilization', title: 'Fleet Utilization', description: 'Distance and active hours metrics.', icon: BarChart, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Export Center</h1>
                    <p className="text-slate-500 mt-2 font-medium">Download live data summaries in high-quality PDF or Excel</p>
                </div>
            </div>

            {/* Date Filtering Section - RESTORED & PROMINENT */}
            <Card className="border-2 border-indigo-200 bg-white shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-6 py-3 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-white" />
                    <h2 className="text-white font-bold">Category Date Range Filter</h2>
                </div>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Reporting Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full h-11 px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 transition-all font-semibold"
                            >
                                <option value="all">All Time / Lifetime</option>
                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                    <option key={m} value={i}>{m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Reporting Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="w-full h-11 px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 transition-all font-semibold"
                                disabled={selectedMonth === 'all'}
                            >
                                {[2026, 2025, 2024, 2023].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Active Filter</p>
                                <p className="text-sm font-black text-indigo-900">
                                    {selectedMonth === 'all' ? 'LIFETIME AGGREGATE' : `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(selectedMonth)]} ${selectedYear}`}
                                </p>
                            </div>
                            {selectedMonth !== 'all' && (
                                <Button variant="ghost" className="text-red-500 hover:text-red-700 font-bold" onClick={() => setSelectedMonth('all')}>Reset</Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Row: Primary Reports */}
            <div className="grid gap-6 md:grid-cols-2">
                 {/* Overall Summary Card */}
                <Card className="border-2 border-blue-200 bg-blue-50/50 hover:shadow-lg transition-all overflow-hidden">
                    <CardHeader className="bg-blue-600 text-white">
                        <div className="flex items-center gap-3">
                            <BarChart className="h-8 w-8" />
                            <div>
                                <CardTitle className="text-xl">Fleet-Wide Summary</CardTitle>
                                <CardDescription className="text-blue-100">Complete performance & financial overview</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
                        <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl" onClick={() => handleExport('overall', 'pdf')} disabled={!!downloading}>
                            <FileText className="mr-2 h-5 w-5" /> PDF Summary
                        </Button>
                        <Button className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl" onClick={() => handleExport('overall', 'excel')} disabled={!!downloading}>
                            <Table className="mr-2 h-5 w-5" /> Excel Spreadsheet
                        </Button>
                    </CardContent>
                </Card>

                {/* Date-Filtered Category Card Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {categoryReports.slice(0, 4).map(report => (
                        <Card key={report.id} className="border-2 border-slate-100 hover:border-indigo-200 transition-all group">
                            <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                                <div className={`p-3 rounded-2xl ${report.bg} ${report.color} group-hover:scale-110 transition-transform`}>
                                    <report.icon className="h-6 w-6" />
                                </div>
                                <h3 className="font-bold text-slate-800">{report.title}</h3>
                                <div className="flex w-full gap-2 mt-auto">
                                    <button onClick={() => handleExport(report.id, 'pdf')} className="flex-1 py-1.5 text-xs font-black bg-slate-900 text-white rounded-lg hover:bg-indigo-600 transition-colors">PDF</button>
                                    <button onClick={() => handleExport(report.id, 'excel')} className="flex-1 py-1.5 text-xs font-black border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">EXCEL</button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Selection Row: Individual Entity Reports */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Vehicle Selection Card */}
                <Card className="border-2 border-purple-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Car className="h-6 w-6 text-purple-600" />
                            <CardTitle className="text-lg">Vehicle Insight</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 outline-none font-bold text-sm"
                        >
                            <option value="">Choose a Vehicle...</option>
                            {vehicles.map(v => (
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.licensePlate} ({v.make})</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-purple-600 font-bold" onClick={() => handleExport('vehicle', 'pdf')} disabled={!selectedVehicle || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-purple-200" onClick={() => handleExport('vehicle', 'excel')} disabled={!selectedVehicle || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Selection Card */}
                <Card className="border-2 border-indigo-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <User className="h-6 w-6 text-indigo-600" />
                            <CardTitle className="text-lg">Driver Scorecard</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-sm"
                        >
                            <option value="">Select Driver...</option>
                            {drivers.map(d => (
                                <option key={d.id || d.driverId} value={d.id || d.driverId}>{d.driverName || d.name}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-indigo-600 font-bold" onClick={() => handleExport('driver', 'pdf')} disabled={!selectedDriver || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-indigo-200" onClick={() => handleExport('driver', 'excel')} disabled={!selectedDriver || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Fuel Log Card */}
                <Card className="border-2 border-green-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Droplet className="h-6 w-6 text-green-600" />
                            <CardTitle className="text-lg">Fuel Consumption</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            value={selectedFuelVehicle}
                            onChange={(e) => setSelectedFuelVehicle(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none font-bold text-sm"
                        >
                            <option value="">Select for Fuel Log...</option>
                            {vehicles.map(v => (
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.licensePlate}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-green-600 font-bold" onClick={() => handleExport('fuellog', 'pdf')} disabled={!selectedFuelVehicle || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-green-200" onClick={() => handleExport('fuellog', 'excel')} disabled={!selectedFuelVehicle || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Log Card - RESTORED */}
                <Card className="border-2 border-orange-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <Wrench className="h-6 w-6 text-orange-600" />
                            <CardTitle className="text-lg">Maintenance Log</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            value={selectedMaintenanceVehicle}
                            onChange={(e) => setSelectedMaintenanceVehicle(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-orange-500 outline-none font-bold text-sm"
                        >
                            <option value="">Select for Logs...</option>
                            {vehicles.map(v => (
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.licensePlate}</option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-orange-600 font-bold" onClick={() => handleExport('maintenancelog', 'pdf')} disabled={!selectedMaintenanceVehicle || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-orange-200" onClick={() => handleExport('maintenancelog', 'excel')} disabled={!selectedMaintenanceVehicle || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Rental Card - RESTORED */}
                <Card className="border-2 border-pink-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <ClipboardList className="h-6 w-6 text-pink-600" />
                            <CardTitle className="text-lg">Rental Contracts</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <select
                            value={selectedRental}
                            onChange={(e) => setSelectedRental(e.target.value)}
                            className="w-full h-10 px-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-pink-500 outline-none font-bold text-sm"
                        >
                            <option value="">Select Booking ID...</option>
                            <option value="ALL">Export All Bookings</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-pink-600 font-bold" onClick={() => handleExport('rental', 'pdf')} disabled={!selectedRental || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-pink-200" onClick={() => handleExport('rental', 'excel')} disabled={!selectedRental || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Analytics Card */}
                <Card className="border-2 border-cyan-200 hover:shadow-lg transition-all">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-6 w-6 text-cyan-600" />
                            <CardTitle className="text-lg">Performance Report</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-xs text-slate-500 font-medium">Generate a comprehensive performance analysis for the entire fleet.</p>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-cyan-600 font-bold" onClick={() => handleExport('performance', 'pdf')} disabled={!!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-cyan-200" onClick={() => handleExport('performance', 'excel')} disabled={!!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
