"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wrench, Plus, AlertTriangle, CheckCircle2, Clock, Check, X, Search, Filter, Car, Calendar, Users, Fuel, Settings, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { authService } from "@/lib/auth";
import { useEffect } from "react";

// --- Mock Data: Maintenance ---
const initialRequests = [
    { id: "REQ-101", vehicle: "Ford F-150 (XYZ-9988)", type: "Engine", issue: "Check Engine Light", status: "In Progress", date: "2024-03-20", cost: "$150" },
    { id: "REQ-102", vehicle: "Tesla Model 3 (EV-001)", type: "Tires", issue: "Tire Replacement", status: "Pending Approval", date: "2024-03-24", cost: "$800" },
    { id: "REQ-103", vehicle: "Toyota Camry (ABC-1234)", type: "Service", issue: "Regular Maintenance", status: "Completed", date: "2024-03-15", cost: "$120" },
    { id: "REQ-104", vehicle: "Isuzu Truck (LMN-777)", type: "Body", issue: "Mirror Damaged", status: "Pending Approval", date: "2024-03-25", cost: "$300" },
];

// --- Mock Data: Vehicle Bookings (Replaces Trips) ---
const initialBookings = [
    { id: "BK-2024-001", vehicle: "Toyota Camry (ABC-123)", startDate: "2024-03-25", endDate: "2024-03-26", status: "Approved", requestedBy: "System User" },
    { id: "BK-2024-002", vehicle: "Ford Transit (TRK-999)", startDate: "2024-03-28", endDate: "2024-03-29", status: "Pending", requestedBy: "Staff Member A" },
    { id: "BK-2024-003", vehicle: "Honda CR-V (XYZ-555)", startDate: "2024-03-20", endDate: "2024-03-22", status: "Completed", requestedBy: "System User" }
];

// --- Mock Data: Vehicles (for Booking) ---
const vehicles = [
    { id: "v1", name: "Toyota Camry", type: "Sedan", plate: "ABC-123", seats: 5, fuel: "Hybrid", image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000", status: "Available", rate: "$45/day" },
    { id: "v2", name: "Ford Transit", type: "Van", plate: "TRK-999", seats: 12, fuel: "Diesel", image: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1000", status: "Available", rate: "$85/day" },
    { id: "v3", name: "Honda CR-V", type: "SUV", plate: "XYZ-555", seats: 5, fuel: "Petrol", image: "https://images.unsplash.com/photo-1568844293986-8d04aad2b30e?auto=format&fit=crop&q=80&w=1000", status: "In Maintenance", rate: "$65/day" },
];

export default function FleetOperationsPage() {
    const { toast } = useToast();

    // State
    const [activeTab, setActiveTab] = useState("maintenance");
    const [currentRole, setCurrentRole] = useState<string | null>(null);

    useEffect(() => {
        const role = authService.getRole();
        setCurrentRole(role);
    }, []);

    // Maintenance State
    const [requests, setRequests] = useState<any[]>([]); // Start empty to avoid overwrite
    const [isReportOpen, setIsReportOpen] = useState(false);

    // New Request Form State
    const [newRequestVehicle, setNewRequestVehicle] = useState("");
    const [newRequestType, setNewRequestType] = useState("service");
    const [newRequestDesc, setNewRequestDesc] = useState("");

    // Booking State
    const [bookings, setBookings] = useState<any[]>([]); // Start empty to avoid overwrite
    const [isBookingOpen, setIsBookingOpen] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // --- EFFECT: Initialize Data ---
    useEffect(() => {
        // Try to load from local storage
        const savedRequests = localStorage.getItem("fleetRequests");
        const savedBookings = localStorage.getItem("fleetBookings");

        if (savedRequests) {
            setRequests(JSON.parse(savedRequests));
        } else {
            setRequests(initialRequests);
        }

        if (savedBookings) {
            setBookings(JSON.parse(savedBookings));
        } else {
            setBookings(initialBookings);
        }

        setIsDataLoaded(true); // Mark as loaded so we can start saving updates
    }, []);

    // --- EFFECT: Save Data on Change (Only after load) ---
    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem("fleetRequests", JSON.stringify(requests));
        }
    }, [requests, isDataLoaded]);

    useEffect(() => {
        if (isDataLoaded) {
            localStorage.setItem("fleetBookings", JSON.stringify(bookings));
        }
    }, [bookings, isDataLoaded]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [bookingStep, setBookingStep] = useState(1); // 1: Select Vehicle, 2: Confirm Details

    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // --- Handlers: Maintenance ---
    const handleReport = () => {
        // Find selected vehicle details
        const vehicle = vehicles.find(v => v.id === newRequestVehicle);

        const newReq = {
            id: `REQ-${Math.floor(Math.random() * 1000)}`,
            vehicle: vehicle ? `${vehicle.name} (${vehicle.plate})` : "Unregistered Vehicle",
            type: newRequestType.toUpperCase(),
            issue: newRequestDesc || "Reported via Portal",
            status: "Pending Approval",
            date: new Date().toISOString().split('T')[0],
            cost: "TBD",
            downtime: "N/A",
            documents: []
        };
        setRequests([newReq, ...requests]);
        toast({ title: "Request Submitted", description: "Your maintenance request is pending approval." });
        setIsReportOpen(false);

        // Reset form
        setNewRequestVehicle("");
        setNewRequestType("service");
        setNewRequestDesc("");
    };

    const handleApprove = (id: string) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: "Approved" } : r));
        toast({ title: "Request Approved", description: `Maintenance request ${id} has been approved.` });
    };

    const handleReject = (id: string) => {
        setRequests(requests.map(r => r.id === id ? { ...r, status: "Rejected" } : r));
        toast({ variant: "destructive", title: "Request Rejected", description: `Maintenance request ${id} has been rejected.` });
    };

    const handleViewDetails = (req: any) => {
        setSelectedRequest({ ...req }); // Clone to avoid direct mutation
        setIsDetailsOpen(true);
    };

    const handleSaveDetails = () => {
        setRequests(requests.map(r => r.id === selectedRequest.id ? selectedRequest : r));
        setIsDetailsOpen(false);
        toast({ title: "Details Updated", description: "Maintenance record updated successfully." });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newDoc = { name: file.name, url: "#", date: new Date().toISOString().split('T')[0] };
            setSelectedRequest({
                ...selectedRequest,
                documents: [...(selectedRequest.documents || []), newDoc]
            });
            toast({ title: "File Uploaded", description: `${file.name} attached to request.` });
        }
    };

    // --- Handlers: Bookings ---
    const handleBookVehicle = () => {
        const newBooking = {
            id: `BK-2024-${Math.floor(Math.random() * 1000)}`,
            vehicle: selectedVehicle?.name || "Assigned Vehicle",
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0], // Mock same day return
            status: "Pending",
            requestedBy: currentRole === 'ADMIN' ? "System User" : "Approver"
        };
        setBookings([newBooking, ...bookings]);
        toast({ title: "Booking Requested", description: "Vehicle reservation request submitted." });
        setIsBookingOpen(false);
        setBookingStep(1);
        setSelectedVehicle(null);
    };

    const handleApproveBooking = (id: string) => {
        setBookings(bookings.map(b => b.id === id ? { ...b, status: "Approved" } : b));
        toast({ title: "Booking Approved", description: `Vehicle booking ${id} confirmed.` });
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">

            {/* Header & Role Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Maintenance & Rentals</h1>
                    <p className="text-slate-500 font-medium mt-1">Manage Vehicle Maintenance & Rentals.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Current Role:</span>
                    <Badge variant="secondary" className="font-bold">{currentRole || "Guest"}</Badge>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="maintenance" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Maintenance & Repairs</TabsTrigger>
                    <TabsTrigger value="rentals" className="rounded-lg px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Vehicle Bookings</TabsTrigger>
                </TabsList>

                {/* --- MAINTENANCE TAB --- */}
                <TabsContent value="maintenance" className="space-y-8">
                    {/* Actions Row */}
                    <div className="flex justify-end">
                        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                            <DialogTrigger asChild>
                                <Button className="font-bold bg-slate-900 text-white shadow-lg shadow-slate-200">
                                    <Plus className="mr-2 h-4 w-4" /> New Maintenance Request
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 text-slate-900">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black">Report Issue</DialogTitle>
                                    <DialogDescription>Create a new maintenance request for a vehicle.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Vehicle</label>
                                        <Select onValueChange={setNewRequestVehicle} value={newRequestVehicle}>
                                            <SelectTrigger className="bg-white text-slate-900 border-slate-200 font-medium">
                                                <SelectValue placeholder="Select vehicle..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map(v => (
                                                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.plate})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Issue Type</label>
                                        <Select onValueChange={setNewRequestType} value={newRequestType}>
                                            <SelectTrigger className="bg-white text-slate-900 border-slate-200 font-medium">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="mechanical">Mechanical</SelectItem>
                                                <SelectItem value="tire">Tire / Wheel</SelectItem>
                                                <SelectItem value="service">Regular Service</SelectItem>
                                                <SelectItem value="body">Body / Paint</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold">Description</label>
                                        <Textarea
                                            value={newRequestDesc}
                                            onChange={(e) => setNewRequestDesc(e.target.value)}
                                            placeholder="Describe the issue..."
                                            className="font-medium bg-white text-slate-900 border-slate-200"
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleReport} disabled={!newRequestVehicle} className="font-bold bg-slate-900 text-white">Submit Request</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Status Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-l-4 border-l-red-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Attention Needed</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-slate-900">2</div><p className="text-xs font-bold text-red-500 mt-1">Pending Approval</p></CardContent></Card>
                        <Card className="border-l-4 border-l-amber-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Scheduled</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-slate-900">5</div><p className="text-xs font-bold text-amber-500 mt-1">Upcoming Service</p></CardContent></Card>
                        <Card className="border-l-4 border-l-emerald-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Completed</CardTitle></CardHeader><CardContent><div className="text-3xl font-black text-slate-900">142</div><p className="text-xs font-bold text-emerald-500 mt-1">This Month</p></CardContent></Card>
                    </div>

                    {/* Requests Table */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-500">ID</TableHead>
                                    <TableHead className="font-bold text-slate-500">Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-500">Issue</TableHead>
                                    <TableHead className="font-bold text-slate-500">Date</TableHead>
                                    <TableHead className="font-bold text-slate-500">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-500">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests.map((req) => (
                                    <TableRow key={req.id} className="group hover:bg-slate-50/50">
                                        <TableCell className="font-mono font-bold text-slate-500">{req.id}</TableCell>
                                        <TableCell className="font-bold text-slate-900">{req.vehicle}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="font-bold text-[10px] uppercase">{req.type}</Badge>
                                                <span className="text-sm font-medium text-slate-600">{req.issue}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-600">{req.date}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''} ${req.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''} ${req.status === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''} ${req.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' : ''}`}>{req.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {currentRole === 'APPROVER' && req.status === 'Pending Approval' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" className="h-8 w-8 bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => handleApprove(req.id)}><Check className="h-4 w-4" /></Button>
                                                    <Button size="icon" className="h-8 w-8 bg-red-500 hover:bg-red-600 text-white" onClick={() => handleReject(req.id)}><X className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="sm" className="font-bold text-slate-400 hover:text-slate-900" onClick={() => handleViewDetails(req)}>Details</Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="font-bold text-slate-400 hover:text-slate-900" onClick={() => handleViewDetails(req)}>Details</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* --- DETAILS DIALOG --- */}
                    <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                        <DialogContent className="sm:max-w-[600px] bg-white text-slate-900">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Request Details</DialogTitle>
                                <DialogDescription>View and manage maintenance details.</DialogDescription>
                            </DialogHeader>
                            {selectedRequest && (
                                <div className="space-y-6 py-2">
                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                        <div><span className="text-xs font-bold text-slate-400 uppercase">Request ID</span><div className="font-mono font-bold">{selectedRequest.id}</div></div>
                                        <div><span className="text-xs font-bold text-slate-400 uppercase">Date</span><div className="font-medium">{selectedRequest.date}</div></div>
                                        <div className="col-span-2"><span className="text-xs font-bold text-slate-400 uppercase">Vehicle</span><div className="font-bold">{selectedRequest.vehicle}</div></div>
                                        <div className="col-span-2"><span className="text-xs font-bold text-slate-400 uppercase">Issue</span><div className="font-medium">{selectedRequest.issue}</div></div>
                                    </div>

                                    {/* Editable Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="font-bold">Total Cost</Label>
                                            <Input
                                                value={selectedRequest.cost}
                                                onChange={(e) => setSelectedRequest({ ...selectedRequest, cost: e.target.value })}
                                                className="bg-white font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="font-bold">Downtime (Days)</Label>
                                            <Input
                                                value={selectedRequest.downtime || "0"}
                                                onChange={(e) => setSelectedRequest({ ...selectedRequest, downtime: e.target.value })}
                                                className="bg-white font-bold"
                                            />
                                        </div>
                                    </div>

                                    {/* Documents Section */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <Label className="font-bold">Documents (Invoices/Quotes)</Label>
                                            <div className="relative">
                                                <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                                                <Label htmlFor="file-upload" className="cursor-pointer text-xs font-bold bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200">
                                                    + Upload File
                                                </Label>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 space-y-2 min-h-[60px]">
                                            {selectedRequest.documents && selectedRequest.documents.length > 0 ? (
                                                selectedRequest.documents.map((doc: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded border border-slate-200 shadow-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="bg-blue-100 text-blue-600 p-1 rounded"><Settings className="w-3 h-3" /></div>
                                                            <span className="text-sm font-medium">{doc.name}</span>
                                                        </div>
                                                        <span className="text-xs text-slate-400">{doc.date}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-xs text-slate-400 py-2">No documents attached.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                                <Button onClick={handleSaveDetails} className="bg-slate-900 text-white font-bold">Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* --- VEHICLE BOOKINGS TAB (Refined Scope) --- */}
                <TabsContent value="rentals" className="space-y-8">
                    <div className="flex justify-between items-center bg-slate-900 text-white p-6 rounded-3xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black mb-2">Vehicle Rentals</h2>
                            <p className="text-slate-400 font-medium mb-6">Reserve vehicles for official use.</p>
                            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                                <DialogTrigger asChild>
                                    <Button className="font-bold bg-amber-400 text-slate-900 hover:bg-amber-300">
                                        <Plus className="mr-2 h-4 w-4" /> New Booking
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[800px] h-[80vh] overflow-y-auto bg-white border-slate-200 text-slate-900 flex flex-col p-0">
                                    <DialogHeader className="p-6 border-b border-slate-100">
                                        <DialogTitle className="text-2xl font-black">
                                            {bookingStep === 1 ? "Select Vehicle" : "Rental Details"}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {bookingStep === 1 ? "Choose a vehicle to rent." : `Set dates for ${selectedVehicle?.name}`}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
                                        {bookingStep === 1 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {vehicles.map((v) => (
                                                    <Card key={v.id} className="border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group" onClick={() => { if (v.status === 'Available') { setSelectedVehicle(v); setBookingStep(2); } }}>
                                                        <div className="relative h-32 bg-slate-200 overflow-hidden rounded-t-xl">
                                                            <img src={v.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                            <Badge className={`absolute top-2 right-2 ${v.status === 'Available' ? 'bg-green-500' : 'bg-red-500'}`}>{v.status}</Badge>
                                                        </div>
                                                        <CardContent className="p-4">
                                                            <h3 className="font-bold text-lg text-slate-900">{v.name}</h3>
                                                            <p className="text-xs text-slate-500 font-bold uppercase">{v.type} • {v.rate}</p>
                                                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-600 font-medium">
                                                                <Users className="w-3 h-3" /> {v.seats}
                                                                <Fuel className="w-3 h-3" /> {v.fuel}
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-6 max-w-md mx-auto">
                                                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                                    <img src={selectedVehicle?.image} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                                                    <div>
                                                        <h4 className="font-bold text-slate-900">{selectedVehicle?.name}</h4>
                                                        <p className="text-xs text-slate-500 font-bold">{selectedVehicle?.plate}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="ml-auto text-xs font-bold text-blue-600" onClick={() => setBookingStep(1)}>Change</Button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Check-out Date</Label>
                                                        <Input type="date" className="bg-white" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="font-bold">Check-in Date</Label>
                                                        <Input type="date" className="bg-white" />
                                                    </div>
                                                </div>

                                                {/* Simplified Driver Selection (Scope Refinement) */}
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Assigned Driver</Label>
                                                    <Select defaultValue="self">
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select driver" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="self">Self-Drive ( {currentRole === 'ADMIN' ? "System User" : "Approver"} )</SelectItem>
                                                            <SelectItem value="pool">Request Pool Driver</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {bookingStep === 2 && (
                                        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                                            <Button variant="ghost" onClick={() => setBookingStep(1)} className="font-bold">Back</Button>
                                            <Button onClick={handleBookVehicle} className="font-bold bg-slate-900 text-white">Confirm Reservation</Button>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl opacity-50 translate-x-10 -translate-y-10"></div>
                    </div>

                    {/* Bookings List */}
                    <Card className="border-slate-200 shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="font-bold text-slate-500">Booking ID</TableHead>
                                    <TableHead className="font-bold text-slate-500">Vehicle</TableHead>
                                    <TableHead className="font-bold text-slate-500">Requested By</TableHead>
                                    <TableHead className="font-bold text-slate-500">Dates</TableHead>
                                    <TableHead className="font-bold text-slate-500">Status</TableHead>
                                    <TableHead className="text-right font-bold text-slate-500">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bookings.map((booking) => (
                                    <TableRow key={booking.id} className="hover:bg-slate-50">
                                        <TableCell className="font-mono font-bold text-slate-500">{booking.id}</TableCell>
                                        <TableCell className="font-medium text-slate-900">{booking.vehicle}</TableCell>
                                        <TableCell className="text-slate-600"><div className="flex items-center gap-2"><User className="w-3 h-3" /> {booking.requestedBy}</div></TableCell>
                                        <TableCell className="text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                <span className="text-xs">{booking.startDate} to {booking.endDate}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${booking.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-200' : ''} ${booking.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}`}>
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {currentRole === 'APPROVER' && booking.status === 'Pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" className="bg-emerald-500 text-white font-bold h-7" onClick={() => handleApproveBooking(booking.id)}>Approve</Button>
                                                </div>
                                            ) : (
                                                <Button variant="ghost" size="sm" className="font-bold text-slate-400">View</Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
