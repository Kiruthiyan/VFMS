"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    MoreHorizontal, Plus, Search,
    Filter, MapPin, Calendar, Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/roleContext";
import RoleSwitcher from "@/components/RoleSwitcher";
import api from "@/lib/api";

interface Trip {
    id: string;
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    status: string;
    passengerCount: number;
    assignedDriverId: string | null;
    assignedVehicleId: string | null;
    requesterId: string;
}

const statusStyles: Record<string, string> = {
    NEW: "bg-slate-50 text-slate-700 border-slate-200 font-bold",
    SUBMITTED: "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    APPROVED: "bg-green-50 text-green-700 border-green-200 font-bold",
    REJECTED: "bg-red-50 text-red-700 border-red-200 font-bold",
    ONGOING: "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED: "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-300 font-bold",
};

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const router = useRouter();
    const { currentUser } = useRole();

    useEffect(() => {
        fetchTrips();
    }, [currentUser]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            let response;
            if (currentUser.role === "SYSTEM_USER") {
                response = await api.get(`/trips/requester/${currentUser.id}/history`);
            } else if (currentUser.role === "DRIVER") {
                response = await api.get(`/trips/driver/${currentUser.id}`);
            } else {
                // STAFF and ADMIN see all trips
                response = await api.get("/trips");
            }
            setTrips(response.data);
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setLoading(false);
        }
    };

    const filtered = trips.filter(t =>
        t.destination.toLowerCase().includes(search.toLowerCase()) ||
        t.purpose.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString("en-GB", {
            day: "2-digit", month: "short",
            year: "numeric", hour: "2-digit", minute: "2-digit"
        });

    const getPageTitle = () => {
        switch (currentUser.role) {
            case "SYSTEM_USER": return "My Trip Requests";
            case "STAFF": return "Pending Approvals";
            case "DRIVER": return "My Assignments";
            case "ADMIN": return "All Trips";
        }
    };

    const getStats = () => {
        switch (currentUser.role) {
            case "SYSTEM_USER":
                return [
                    { label: "Total", value: trips.length, color: "text-slate-900" },
                    { label: "Pending", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                    { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                    { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
                ];
            case "STAFF":
                return [
                    { label: "All Trips", value: trips.length, color: "text-slate-900" },
                    { label: "Needs Review", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                    { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                    { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
                ];
            case "DRIVER":
                return [
                    { label: "Assigned", value: trips.length, color: "text-slate-900" },
                    { label: "Upcoming", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                    { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
                    { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
                ];
            case "ADMIN":
                return [
                    { label: "Total", value: trips.length, color: "text-slate-900" },
                    { label: "Submitted", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                    { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
                    { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
                ];
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-6">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        {getPageTitle()}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Logged in as <span className="font-bold text-blue-950">{currentUser.name}</span>
                        <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                            {currentUser.role}
                        </span>
                    </p>
                </div>
                {(currentUser.role === "SYSTEM_USER" || currentUser.role === "ADMIN") && (
                    <Button
                        className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                        onClick={() => router.push("/trips/create")}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Trip Request
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {getStats()?.map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-6">
                        <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">
                            {stat.label}
                        </div>
                        <div className={`text-3xl font-black mt-2 ${stat.color}`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by destination or purpose..."
                        className="pl-9 border-none bg-transparent focus-visible:ring-0"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="h-6 w-px bg-slate-200" />
                <Button variant="ghost" size="sm" className="text-slate-600">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Purpose</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Departure</TableHead>
                            <TableHead>Passengers</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                        <span className="text-slate-500">Loading trips...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No trips found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((trip) => (
                                <TableRow
                                    key={trip.id}
                                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/trips/${trip.id}`)}
                                >
                                    <TableCell className="font-medium text-slate-900">
                                        {trip.purpose}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <MapPin className="h-3 w-3 text-blue-950" />
                                            {trip.destination}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(trip.departureTime)}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-700">
                                        {trip.passengerCount}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={statusStyles[trip.status] || ""}
                                        >
                                            {trip.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell
                                        className="text-right"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="bg-white text-slate-900"
                                            >
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/trips/${trip.id}`)}
                                                >
                                                    View details
                                                </DropdownMenuItem>
                                                {currentUser.role === "SYSTEM_USER" && trip.status === "NEW" && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/trips/${trip.id}/edit`)}
                                                    >
                                                        Edit trip
                                                    </DropdownMenuItem>
                                                )}
                                                {currentUser.role === "STAFF" && trip.status === "SUBMITTED" && (
                                                    <DropdownMenuItem
                                                        onClick={() => router.push(`/trips/${trip.id}/approve`)}
                                                    >
                                                        Review & Approve
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                {["SYSTEM_USER", "STAFF", "ADMIN"].includes(currentUser.role) &&
                                                    !["COMPLETED", "CANCELLED", "REJECTED"].includes(trip.status) && (
                                                        <DropdownMenuItem className="text-red-600">
                                                            Cancel trip
                                                        </DropdownMenuItem>
                                                    )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Role Switcher for testing */}
            <RoleSwitcher />
        </div>
    );
}