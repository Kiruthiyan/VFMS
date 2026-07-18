"use client";

import { useState, useEffect, useRef } from "react";
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
    const [rentals, setRentals] = useState<any[]>([]);

    // Date range filter for category reports
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [appliedStartDate, setAppliedStartDate] = useState<string>('');
    const [appliedEndDate, setAppliedEndDate] = useState<string>('');
    
    // Date input refs for triggering picker
    const startDateInputRef = useRef<HTMLInputElement>(null);
    const endDateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [vData, dData] = await Promise.all([
                    reportService.getRentals(),
                    reportService.getVehicles(),
                    reportService.getDriverPerformance()
                ]);
                setVehicles(vData);
                setRentals((await reportService.getRentals()) || []);
                setDrivers(dData);
                
                setSelectedVehicle('');
                setSelectedFuelVehicle('');
                setSelectedMaintenanceVehicle('');
                setSelectedDriver('');
            } catch (e) {
                console.error("Export page data load failed", e);
            }
        };
        loadData();
    }, []);

    const getDateRange = () => {
        return {
            startDate: appliedStartDate || undefined,
            endDate: appliedEndDate || undefined
        };
    };

    const handleApplyDateRange = () => {
        if (startDate || endDate) {
            setAppliedStartDate(startDate);
            setAppliedEndDate(endDate);
        }
    };

    const handleResetDateRange = () => {
        setStartDate('');
        setEndDate('');
        setAppliedStartDate('');
        setAppliedEndDate('');
    };

    const getFormattedDateRange = () => {
        if (!appliedStartDate && !appliedEndDate) return 'All Time';
        if (appliedStartDate && appliedEndDate) {
            return `${new Date(appliedStartDate).toLocaleDateString('en-US')} to ${new Date(appliedEndDate).toLocaleDateString('en-US')}`;
        }
        if (appliedStartDate) return `From ${new Date(appliedStartDate).toLocaleDateString('en-US')}`;
        if (appliedEndDate) return `Until ${new Date(appliedEndDate).toLocaleDateString('en-US')}`;
        return 'All Time';
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Export Center</h1>
                    <p className="text-slate-500 mt-2 font-medium">Download live data summaries in high-quality PDF or Excel</p>
                </div>
            </div>

            {/* Date Filtering Section */}
            <Card className="border-2 border-indigo-200 bg-white shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-white" />
                        <h2 className="text-white font-bold">Select Period</h2>
                    </div>
                </div>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Start Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">Start Date</label>
                                <div className="relative">
                                    <input
                                        ref={startDateInputRef}
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="mm/dd/yyyy"
                                        className="w-full h-11 px-4 py-2 pr-10 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-semibold text-slate-700 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    />
                                    <div
                                        onClick={() => startDateInputRef.current?.showPicker()}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                                    >
                                        <Calendar className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                    </div>
                                </div>
                            </div>

                            {/* End Date */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">End Date</label>
                                <div className="relative">
                                    <input
                                        ref={endDateInputRef}
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="mm/dd/yyyy"
                                        className="w-full h-11 px-4 py-2 pr-10 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-semibold text-slate-700 cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                                    />
                                    <div
                                        onClick={() => endDateInputRef.current?.showPicker()}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded cursor-pointer transition-colors"
                                    >
                                        <Calendar className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons and Active Filter Display */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                            <div className="flex gap-3">
                                <Button 
                                    type="button"
                                    variant="outline" 
                                    className="font-bold text-slate-700 border-slate-300 hover:bg-slate-50"
                                    onClick={handleResetDateRange}
                                >
                                    RESET
                                </Button>
                                <Button 
                                    type="button"
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6"
                                    onClick={handleApplyDateRange}
                                >
                                    APPLY
                                </Button>
                            </div>

                            {/* Active Filter Display */}
                            <div className="flex-1 md:flex-none p-3 bg-indigo-50 rounded-lg border border-indigo-200 text-center md:text-right">
                                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Active Filter</p>
                                <p className="text-sm font-black text-indigo-900">{getFormattedDateRange()}</p>
                            </div>
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
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.plateNumber} ({v.brand} {v.model})</option>
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
                                <option key={d.id || d.driverId} value={d.id || d.driverId}>{d.driverName || d.name || "Unknown Driver"}</option>
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
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.plateNumber}</option>
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
                                <option key={v.id || v.vehicleId} value={v.id || v.vehicleId}>{v.plateNumber}</option>
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
                            <option value="">Select Rental...</option>
                            {rentals.map(r => (
                                <option key={r.id} value={String(r.id)}>
                                    {r.plateNumber || r.vehicleType || "Vehicle"} — {r.vendorName || "Vendor"} ({r.startDate || "-"})
                                </option>
                            ))}
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className="bg-pink-600 font-bold" onClick={() => handleExport('rental', 'pdf')} disabled={!selectedRental || !!downloading}>PDF</Button>
                            <Button size="sm" variant="outline" className="font-bold border-pink-200" onClick={() => handleExport('rental', 'excel')} disabled={!selectedRental || !!downloading}>Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
