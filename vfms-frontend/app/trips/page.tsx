"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, MapPin, Calendar, Loader2, X, ChevronDown } from "lucide-react";
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

const STATUS_OPTIONS = ["ALL", "NEW", "SUBMITTED", "APPROVED", "DRIVER_CONFIRMED", "DRIVER_REJECTED", "ONGOING", "COMPLETED", "REJECTED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
    NEW:              "bg-slate-50 text-slate-700 border-slate-200 font-bold",
    SUBMITTED:        "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    APPROVED:         "bg-green-50 text-green-700 border-green-200 font-bold",
    DRIVER_CONFIRMED: "bg-teal-50 text-teal-700 border-teal-200 font-bold",
    DRIVER_REJECTED:  "bg-orange-50 text-orange-700 border-orange-200 font-bold",
    REJECTED:         "bg-red-50 text-red-700 border-red-200 font-bold",
    ONGOING:          "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED:        "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED:        "bg-slate-100 text-slate-500 border-slate-300 font-bold",
};

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchDestination, setSearchDestination] = useState("");
    const [searchPurpose, setSearchPurpose] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [departureDateFilter, setDepartureDateFilter] = useState("");
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
                response = await api.get("/trips");
            }
            setTrips(response.data);
        } catch (error) {
            console.error("Failed to fetch trips", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTrips = trips.filter(t => {
        const matchesDestination = searchDestination === "" ||
            t.destination.toLowerCase().includes(searchDestination.toLowerCase());
        const matchesPurpose = searchPurpose === "" ||
            t.purpose.toLowerCase().includes(searchPurpose.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
        const matchesDate = departureDateFilter === "" ||
            t.departureTime.startsWith(departureDateFilter);
        return matchesDestination && matchesPurpose && matchesStatus && matchesDate;
    });

    const uniqueDestinations = [...new Set(trips.map(t => t.destination))].sort();
    const uniquePurposes = [...new Set(trips.map(t => t.purpose))].sort();

    const isFiltersActive = searchDestination !== "" || searchPurpose !== "" ||
        statusFilter !== "ALL" || departureDateFilter !== "";

    const clearFilters = () => {
        setSearchDestination("");
        setSearchPurpose("");
        setStatusFilter("ALL");
        setDepartureDateFilter("");
    };

    const getPageTitle = () => {
        const titles: Record<string, string> = {
            SYSTEM_USER: "My Trip Requests",
            STAFF:       "Trip Management",
            DRIVER:      "My Assignments",
            ADMIN:       "All Trips",
        };
        return titles[currentUser.role] ?? "Trips";
    };

    const getStats = () => {
        const base = [
            { label: "Total", value: trips.length, color: "text-slate-900" },
        ];
        const byRole: Record<string, { label: string; value: number; color: string }[]> = {
            SYSTEM_USER: [
                { label: "Pending", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
            ],
            STAFF: [
                { label: "Needs Review", value: trips.filter(t => ["SUBMITTED", "DRIVER_REJECTED"].includes(t.status)).length, color: "text-amber-600" },
                { label: "Approved", value: trips.filter(t => t.status === "APPROVED").length, color: "text-green-600" },
                { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
            ],
            DRIVER: [
                { label: "Awaiting Confirm", value: trips.filter(t => t.status === "APPROVED").length, color: "text-amber-600" },
                { label: "Confirmed", value: trips.filter(t => t.status === "DRIVER_CONFIRMED").length, color: "text-teal-600" },
                { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
            ],
            ADMIN: [
                { label: "Submitted", value: trips.filter(t => t.status === "SUBMITTED").length, color: "text-amber-600" },
                { label: "Ongoing", value: trips.filter(t => t.status === "ONGOING").length, color: "text-purple-600" },
                { label: "Completed", value: trips.filter(t => t.status === "COMPLETED").length, color: "text-blue-600" },
            ],
        };
        return [...base, ...(byRole[currentUser.role] ?? [])];
    };

    const canCancelTrip = (tripStatus: string) =>
        (currentUser.role === "SYSTEM_USER" || currentUser.role === "ADMIN") &&
        !["COMPLETED", "CANCELLED", "REJECTED"].includes(tripStatus);

    return (
        <div className="min-h-screen bg-slate-50 p-6 space-y-4">

            {/* Role Switcher — inline at top, no overlay */}
            <RoleSwitcher />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">
                        {getPageTitle()}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        Logged in as <span className="font-bold text-blue-950">{currentUser.name}</span>
                        <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                            {currentUser.role.replace("_", " ")}
                        </span>
                    </p>
                </div>
                {currentUser.role === "SYSTEM_USER" && (
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
                {getStats().map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 p-5">
                        <div className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                            {stat.label}
                        </div>
                        <div className={`text-3xl font-black mt-2 ${stat.color}`}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter Section — only for STAFF and ADMIN */}
            {["STAFF", "ADMIN"].includes(currentUser.role) && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Filter Trips
                    </p>
                    {isFiltersActive && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 text-xs text-red-500 font-medium hover:text-red-700 transition-colors"
                        >
                            <X className="h-3 w-3" /> Clear all filters
                        </button>
                    )}
                </div>

                {/* Search row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Destination</p>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={searchDestination}
                                onChange={e => setSearchDestination(e.target.value)}
                                className="flex h-9 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="">All destinations</option>
                                {uniqueDestinations.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purpose</p>
                        <div className="relative">
                            <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                            <select
                                value={searchPurpose}
                                onChange={e => setSearchPurpose(e.target.value)}
                                className="flex h-9 w-full appearance-none rounded-md border border-slate-200 bg-white px-3 pr-8 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="">All purposes</option>
                                {uniquePurposes.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Status + Date row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</p>
                        <div className="flex flex-wrap gap-1.5">
                            {STATUS_OPTIONS.map(status => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                                        statusFilter === status
                                            ? "bg-blue-950 text-white border-blue-950"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                    }`}
                                >
                                    {status === "ALL" ? "ALL" : status.replace("_", " ")}
                                    <span className="ml-1 opacity-50 text-[10px]">
                                        ({status === "ALL" ? trips.length : trips.filter(t => t.status === status).length})
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Departure Date</p>
                        <input
                            type="date"
                            value={departureDateFilter}
                            onChange={e => setDepartureDateFilter(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>
                </div>

                {isFiltersActive && (
                    <p className="text-xs text-slate-500">
                        Showing <span className="font-bold text-slate-900">{filteredTrips.length}</span> of {trips.length} trips
                    </p>
                )}
            </div>
            )}

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
                        ) : filteredTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No trips found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTrips.map(trip => (
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
                                    <TableCell className="text-slate-700">{trip.passengerCount}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={STATUS_STYLES[trip.status] ?? ""}>
                                            {trip.status.replace("_", " ")}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-white text-slate-900">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => router.push(`/trips/${trip.id}`)}>
                                                    View details
                                                </DropdownMenuItem>
                                                {currentUser.role === "SYSTEM_USER" && trip.status === "NEW" && (
                                                    <DropdownMenuItem onClick={() => router.push(`/trips/${trip.id}/edit`)}>
                                                        Edit trip
                                                    </DropdownMenuItem>
                                                )}
                                                {currentUser.role === "STAFF" &&
                                                    ["SUBMITTED", "DRIVER_REJECTED"].includes(trip.status) && (
                                                    <DropdownMenuItem onClick={() => router.push(`/trips/${trip.id}/approve`)}>
                                                        Review & Assign
                                                    </DropdownMenuItem>
                                                )}
                                                {canCancelTrip(trip.status) && (
                                                    <>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => router.push(`/trips/${trip.id}`)}
                                                        >
                                                            Cancel trip
                                                        </DropdownMenuItem>
                                                    </>
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
        </div>
    );
}
