"use client";

import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, Table, BarChart, Car, User, Droplet, Wrench, Calendar, ClipboardList, RefreshCw } from "lucide-react";
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

    // Saved reports history state
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [loadingReports, setLoadingReports] = useState<boolean>(false);
    const primaryExportButtonClass = "rounded-xl bg-slate-950 font-bold text-white shadow-sm shadow-slate-950/15 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:!bg-slate-100 disabled:!text-slate-400 disabled:!opacity-100 disabled:!shadow-none disabled:hover:!bg-slate-100 disabled:[&_svg]:!text-slate-400";
    const excelExportButtonClass = "rounded-xl border-emerald-200 bg-emerald-50 font-bold text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:!bg-slate-50 disabled:!text-slate-400 disabled:!opacity-100 disabled:!shadow-none disabled:hover:!bg-slate-50 disabled:[&_svg]:!text-slate-400";

    const loadSavedReports = async () => {
        setLoadingReports(true);
        try {
            const data = await reportService.getReportDocuments();
            setSavedReports(data || []);
        } catch (e) {
            console.error("Failed to load saved reports", e);
        } finally {
            setLoadingReports(false);
        }
    };

    const handleDeleteReport = async (id: number) => {
        try {
            await reportService.deleteReportDocument(id);
            toast({
                title: "Removed from History",
                description: "The report file and database record are preserved for audit history.",
            });
            await loadSavedReports();
        } catch (error) {
            console.error("Delete report error:", error);
            toast({
                title: "Delete Failed",
                description: "Failed to delete the report. Please try again.",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const [rentalsData, vehiclesData, driversData] = await Promise.all([
                    reportService.getRentals(),
                    reportService.getVehicles(),
                    reportService.getDriverPerformance()
                ]);
                setVehicles(vehiclesData);
                setRentals(rentalsData || []);
                setDrivers(driversData);

                setSelectedVehicle('');
                setSelectedFuelVehicle('');
                setSelectedMaintenanceVehicle('');
                setSelectedDriver('');
            } catch (e) {
                console.error("Export page data load failed", e);
            }
        };
        loadData();
        loadSavedReports();
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
            let result: { blob: Blob; fileName: string } | undefined = undefined;

            // Overall Summary
            if (type === 'overall') {
                const summary = await reportService.getDashboardStats();
                if (format === 'pdf') result = exportService.exportOverallSummaryPDF(summary);
                else result = exportService.exportOverallSummaryExcel(summary);
            }
            // Individual Vehicle
            else if (type === 'vehicle') {
                const vehicleId = id || selectedVehicle;
                const vehicle = vehicles.find(v => (v.id || v.vehicleId).toString() === vehicleId.toString());
                if (format === 'pdf') result = exportService.exportVehicleReportPDF(vehicle);
                else result = exportService.exportVehicleReportExcel(vehicle);
            }
            // Individual Driver
            else if (type === 'driver') {
                const driverId = id || selectedDriver;
                const driver = drivers.find(d => (d.id || d.driverId).toString() === driverId.toString());
                if (format === 'pdf') result = exportService.exportDriverReportPDF(driver);
                else result = exportService.exportDriverReportExcel(driver);
            }
            // Category Reports
            else if (type === 'maintenance') {
                const data = await reportService.getMaintenanceAnalytics();
                if (format === 'pdf') result = exportService.exportMaintenancePDF(data, startDate, endDate);
                else result = exportService.exportMaintenanceExcel(data);
            }
            else if (type === 'fuel') {
                const data = await reportService.getFuelLogs();
                if (format === 'pdf') result = exportService.exportFuelPDF(data, startDate, endDate);
                else result = exportService.exportFuelExcel(data);
            }
            // Fuel Log for specific vehicle
            else if (type === 'fuellog') {
                const data = await reportService.getFuelLogs();
                const vehicleId = id || selectedFuelVehicle;
                const filtered = data.filter((f: any) => (f.vehicleId || '').toString() === vehicleId.toString());
                if (format === 'pdf') result = exportService.exportFuelPDF(filtered);
                else result = exportService.exportFuelExcel(filtered);
            }
            // Maintenance Log for specific vehicle
            else if (type === 'maintenancelog') {
                const data = await reportService.getMaintenanceAnalytics();
                const vehicleId = id || selectedMaintenanceVehicle;
                const filtered = data.filter((m: any) => (m.vehicleId || m.licensePlate || '').toString() === vehicleId.toString());
                if (format === 'pdf') result = exportService.exportMaintenancePDF(filtered);
                else result = exportService.exportMaintenanceExcel(filtered);
            }
            // Rental
            else if (type === 'rental') {
                const data = await reportService.getRentals();
                const rentalId = id || selectedRental;
                const filtered = rentalId ? data.filter((r: any) => String(r.id) === String(rentalId)) : data;
                if (format === 'pdf') result = exportService.exportRentalPDF(filtered);
                else result = exportService.exportRentalExcel(filtered);
            }
            // Upload to backend if successfully captured
            if (result && result.blob && result.fileName) {
                const file = new File([result.blob], result.fileName, { type: result.blob.type });
                await reportService.uploadReport(file, type, format, result.fileName);
                await loadSavedReports();
            }

            toast({
                title: "Export Successful",
                description: `Your ${type} ${format.toUpperCase()} report has been downloaded and saved to Supabase storage.`,
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export Failed",
                description: "There was a problem generating or saving your report.",
                variant: "destructive",
            });
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-8">

            <div>
                <Button asChild variant="ghost" className="text-slate-600 hover:text-slate-900 -ml-4 mb-2">
                    <Link href="/dashboards/admin/reports">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Reports Dashboard
                    </Link>
                </Button>
            </div>

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Report Export Center</h1>
                    <p className="text-slate-500 mt-2 font-medium">Download live data summaries in high-quality PDF or Excel</p>
                </div>
            </div>

            {/* Date Filtering Section */}
            <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="vfms-card-header flex items-center justify-between px-6 py-3 pl-8">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-slate-700" />
                        <h2 className="font-bold text-slate-950">Select Period</h2>
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
                                        className="h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 font-semibold text-slate-700 transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 [&::-webkit-calendar-picker-indicator]:opacity-0"
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
                                        className="h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 pr-10 font-semibold text-slate-700 transition-all focus:border-slate-400 focus:ring-2 focus:ring-slate-200 [&::-webkit-calendar-picker-indicator]:opacity-0"
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
                                    className="border-slate-300 bg-white font-bold text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50"
                                    onClick={handleResetDateRange}
                                >
                                    RESET
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-slate-950 px-6 font-bold text-white shadow-lg shadow-slate-950/15 hover:bg-slate-800"
                                    onClick={handleApplyDateRange}
                                >
                                    APPLY
                                </Button>
                            </div>

                            {/* Active Filter Display */}
                            <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-3 text-center md:flex-none md:text-right">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Filter</p>
                                <p className="text-sm font-black text-slate-950">{getFormattedDateRange()}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Top Row: Primary Reports */}
            <div className="grid gap-6">
                 {/* Overall Summary Card */}
                <Card className="w-full overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="vfms-card-header pl-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-slate-950">
                                <BarChart className="h-5 w-5" />
                            </span>
                            <div>
                                <CardTitle className="text-xl text-slate-950">Fleet-Wide Summary</CardTitle>
                                <CardDescription>Complete performance & financial overview</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                        <Button className={`h-12 w-full ${primaryExportButtonClass}`} onClick={() => handleExport('overall', 'pdf')} disabled={!!downloading}>
                            <FileText className="mr-2 h-5 w-5 text-amber-300" /> PDF Summary
                        </Button>
                        <Button variant="outline" className={`h-12 w-full ${excelExportButtonClass}`} onClick={() => handleExport('overall', 'excel')} disabled={!!downloading}>
                            <Table className="mr-2 h-5 w-5 text-emerald-700" /> Excel Spreadsheet
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Selection Row: Individual Entity Reports */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Vehicle Selection Card */}
                <Card className="border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800 ring-1 ring-amber-200">
                                <Car className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-lg">Vehicle Insight</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedVehicle || "NONE"}
                            onValueChange={(value) => setSelectedVehicle(value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger className="h-10 font-bold">
                                <SelectValue placeholder="Choose a vehicle..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Choose a vehicle...</SelectItem>
                                {vehicles.map(v => (
                                    <SelectItem key={v.id || v.vehicleId} value={String(v.id || v.vehicleId)}>{v.plateNumber} ({v.brand} {v.model})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className={`h-9 ${primaryExportButtonClass}`} onClick={() => handleExport('vehicle', 'pdf')} disabled={!selectedVehicle || !!downloading}><FileText className="h-4 w-4 text-amber-300" />PDF</Button>
                            <Button size="sm" variant="outline" className={`h-9 ${excelExportButtonClass}`} onClick={() => handleExport('vehicle', 'excel')} disabled={!selectedVehicle || !!downloading}><Table className="h-4 w-4 text-emerald-700" />Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Driver Selection Card */}
                <Card className="border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-800 ring-1 ring-blue-200">
                                <User className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-lg">Driver Scorecard</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedDriver || "NONE"}
                            onValueChange={(value) => setSelectedDriver(value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger className="h-10 font-bold">
                                <SelectValue placeholder="Select driver..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Select driver...</SelectItem>
                                {drivers.map(d => (
                                    <SelectItem key={d.id || d.driverId} value={String(d.id || d.driverId)}>{d.driverName || d.name || "Unknown Driver"}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className={`h-9 ${primaryExportButtonClass}`} onClick={() => handleExport('driver', 'pdf')} disabled={!selectedDriver || !!downloading}><FileText className="h-4 w-4 text-amber-300" />PDF</Button>
                            <Button size="sm" variant="outline" className={`h-9 ${excelExportButtonClass}`} onClick={() => handleExport('driver', 'excel')} disabled={!selectedDriver || !!downloading}><Table className="h-4 w-4 text-emerald-700" />Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Fuel Log Card */}
                <Card className="border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200">
                                <Droplet className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-lg">Fuel Consumption</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedFuelVehicle || "NONE"}
                            onValueChange={(value) => setSelectedFuelVehicle(value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger className="h-10 font-bold">
                                <SelectValue placeholder="Select for fuel log..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Select for fuel log...</SelectItem>
                                {vehicles.map(v => (
                                    <SelectItem key={v.id || v.vehicleId} value={String(v.id || v.vehicleId)}>{v.plateNumber}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className={`h-9 ${primaryExportButtonClass}`} onClick={() => handleExport('fuellog', 'pdf')} disabled={!selectedFuelVehicle || !!downloading}><FileText className="h-4 w-4 text-amber-300" />PDF</Button>
                            <Button size="sm" variant="outline" className={`h-9 ${excelExportButtonClass}`} onClick={() => handleExport('fuellog', 'excel')} disabled={!selectedFuelVehicle || !!downloading}><Table className="h-4 w-4 text-emerald-700" />Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Maintenance Log Card - RESTORED */}
                <Card className="border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-800 ring-1 ring-orange-200">
                                <Wrench className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-lg">Maintenance Log</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedMaintenanceVehicle || "NONE"}
                            onValueChange={(value) => setSelectedMaintenanceVehicle(value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger className="h-10 font-bold">
                                <SelectValue placeholder="Select for logs..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Select for logs...</SelectItem>
                                {vehicles.map(v => (
                                    <SelectItem key={v.id || v.vehicleId} value={String(v.id || v.vehicleId)}>{v.plateNumber}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className={`h-9 ${primaryExportButtonClass}`} onClick={() => handleExport('maintenancelog', 'pdf')} disabled={!selectedMaintenanceVehicle || !!downloading}><FileText className="h-4 w-4 text-amber-300" />PDF</Button>
                            <Button size="sm" variant="outline" className={`h-9 ${excelExportButtonClass}`} onClick={() => handleExport('maintenancelog', 'excel')} disabled={!selectedMaintenanceVehicle || !!downloading}><Table className="h-4 w-4 text-emerald-700" />Excel</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Rental Card - RESTORED */}
                <Card className="border border-slate-200 bg-white transition-all hover:shadow-md">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-800 ring-1 ring-violet-200">
                                <ClipboardList className="h-5 w-5" />
                            </span>
                            <CardTitle className="text-lg">Rental Contracts</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Select
                            value={selectedRental || "NONE"}
                            onValueChange={(value) => setSelectedRental(value === "NONE" ? "" : value)}
                        >
                            <SelectTrigger className="h-10 font-bold">
                                <SelectValue placeholder="Select rental..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NONE">Select rental...</SelectItem>
                                {rentals.map(r => (
                                    <SelectItem key={r.id} value={String(r.id)}>
                                        {r.plateNumber || r.vehicleType || "Vehicle"} - {r.vendorName || "Vendor"} ({r.startDate || "-"})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="sm" className={`h-9 ${primaryExportButtonClass}`} onClick={() => handleExport('rental', 'pdf')} disabled={!selectedRental || !!downloading}><FileText className="h-4 w-4 text-amber-300" />PDF</Button>
                            <Button size="sm" variant="outline" className={`h-9 ${excelExportButtonClass}`} onClick={() => handleExport('rental', 'excel')} disabled={!selectedRental || !!downloading}><Table className="h-4 w-4 text-emerald-700" />Excel</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Saved Reports / History Section */}
            <Card className="mt-8 overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="relative flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-6 py-4 pl-8">
                    <span className="absolute left-5 top-4 bottom-4 w-1 rounded-full bg-amber-400" aria-hidden="true" />
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-slate-700" />
                        <h2 className="text-slate-950 font-bold text-lg">Saved Reports & Export History</h2>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        className="vfms-refresh-button"
                        onClick={loadSavedReports}
                        disabled={loadingReports}
                        aria-label="Refresh saved report history"
                        title="Refresh saved report history"
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingReports ? "animate-spin" : ""}`} />
                    </Button>
                </div>
                <CardContent className="p-6">
                    {loadingReports ? (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-2"></div>
                            <p className="font-semibold text-sm">Loading saved reports...</p>
                        </div>
                    ) : savedReports.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p className="text-base font-bold">No saved reports found.</p>
                            <p className="text-sm">Generated reports will automatically appear here once exported.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-sm text-slate-500">
                                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 border-b">Report Name</th>
                                        <th scope="col" className="px-6 py-3 border-b">Type</th>
                                        <th scope="col" className="px-6 py-3 border-b">Format</th>
                                        <th scope="col" className="px-6 py-3 border-b">Size</th>
                                        <th scope="col" className="px-6 py-3 border-b">Export Date</th>
                                        <th scope="col" className="px-6 py-3 border-b text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {savedReports.map((report) => (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900 border-b">
                                                {report.fileName}
                                            </td>
                                            <td className="px-6 py-4 border-b">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                    report.reportType === 'overall' ? 'bg-blue-50 text-blue-700' :
                                                    report.reportType === 'vehicle' ? 'bg-purple-50 text-purple-700' :
                                                    report.reportType === 'driver' ? 'bg-indigo-50 text-indigo-700' :
                                                    report.reportType === 'fuellog' ? 'bg-green-50 text-green-700' :
                                                    report.reportType === 'maintenancelog' ? 'bg-orange-50 text-orange-700' :
                                                    'bg-pink-50 text-pink-700'
                                                }`}>
                                                    {report.reportType.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold border-b">
                                                <span className={report.format === 'pdf' ? 'text-rose-600' : 'text-emerald-600'}>
                                                    {report.format.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 border-b">
                                                {(report.fileSize / 1024).toFixed(1)} KB
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 border-b">
                                                {new Date(report.uploadedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-3 border-b">
                                                {report.fileUrl ? (
                                                    <a
                                                        href={report.fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                                    >
                                                        Download
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Unavailable</span>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteReport(report.id)}
                                                    className="text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors"
                                                >
                                                    Remove from History
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
