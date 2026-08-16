"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, Plus, MapPin, Calendar, Loader2, X, Clock, CheckCircle, XCircle, AlertCircle, Users, ClipboardCheck, Route, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRole } from "@/lib/role-context";
import api, { getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

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
    startTime?: string | null;
    endTime?: string | null;
}

const STATUS_OPTIONS = ["ALL", "NEW", "SUBMITTED", "APPROVED", "DRIVER_CONFIRMED", "DRIVER_REJECTED", "ONGOING", "COMPLETED", "REJECTED", "CANCELLED"];

const STATUS_STYLES: Record<string, string> = {
    NEW:              "border-slate-200 bg-slate-50 text-slate-700",
    SUBMITTED:        "border-amber-200 bg-amber-50 text-amber-700",
    APPROVED:         "border-emerald-200 bg-emerald-50 text-emerald-700",
    DRIVER_CONFIRMED: "border-teal-200 bg-teal-50 text-teal-700",
    DRIVER_REJECTED:  "border-orange-200 bg-orange-50 text-orange-700",
    REJECTED:         "border-red-200 bg-red-50 text-red-700",
    EXPIRED:          "border-red-200 bg-red-50 text-red-700",
    ONGOING:          "border-blue-200 bg-blue-50 text-blue-700",
    COMPLETED:        "border-emerald-200 bg-emerald-50 text-emerald-700",
    CANCELLED:        "border-slate-300 bg-slate-100 text-slate-600",
};

const STATUS_ICONS: Record<string, any> = {
    NEW: AlertCircle,
    SUBMITTED: Clock,
    APPROVED: CheckCircle,
    DRIVER_CONFIRMED: CheckCircle,
    DRIVER_REJECTED: XCircle,
    REJECTED: XCircle,
    EXPIRED: AlertCircle,
    ONGOING: Clock,
    COMPLETED: CheckCircle,
    CANCELLED: XCircle,
};

const formatRoute = (dest: string) => {
    if (!dest) return "";
    if (dest.includes(" -> ")) {
        const parts = dest.split(" -> ");
        const start = parts[0];
        const end = parts[parts.length - 1];
        return `${start} → ${end}`;
    }
    return dest;
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
    const authHydrated = useAuthStore((state) => state.hydrated);

    useEffect(() => {
        if (!authHydrated) {
            return;
        }

        if (currentUser.id === "anonymous") {
            setTrips([]);
            setLoading(false);
            return;
        }

        fetchTrips();
    }, [authHydrated, currentUser.id, currentUser.role]);

    const fetchTrips = async () => {
        setLoading(true);
        try {
            let response;
            if (currentUser.role === "SYSTEM_USER") {
                response = await api.get(`/trips/requester/${currentUser.id}/history`);
            } else if (currentUser.role === "DRIVER") {
                response = await api.get(`/trips/driver/${currentUser.id}`);
            } else {
                // ADMIN and APPROVER see all trips
                response = await api.get("/trips");
            }
            setTrips(response.data);
        } catch (error) {
            console.warn("Failed to fetch trips:", getErrorMessage(error));
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
            APPROVER:    "Trip Management",
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
            APPROVER: [
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

    const renderStatusBadge = (status: string) => {
        const StatusIcon = STATUS_ICONS[status] || AlertCircle;
        return (
            <Badge
                variant="outline"
                className={`inline-flex min-w-[112px] whitespace-nowrap items-center justify-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.04em] ${STATUS_STYLES[status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
            >
                <StatusIcon className="h-3 w-3 shrink-0" />
                {status.replaceAll("_", " ")}
            </Badge>
        );
    };

    const renderTripActions = (trip: Trip) => (
        <div onClick={e => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="outline"
                        className="h-10 w-10 rounded-xl border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    >
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
                    {["APPROVER", "ADMIN"].includes(currentUser.role) &&
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
        </div>
    );

    return (
        <div className="mx-auto min-h-screen max-w-[1500px] space-y-4 bg-slate-50 p-4 sm:p-6">

            {/* Header */}
            <PageHeader
                title={getPageTitle()}
                description="Review trip requests, schedules, assignments, and booking progress from one operational workspace."
                icon={Route}
                iconClassName="text-amber-700"
                actions={
                  ["SYSTEM_USER", "ADMIN"].includes(currentUser.role) ? (
                    <Button
                        onClick={() => router.push("/trips/create")}
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Trip Request
                    </Button>
                  ) : null
                }
            />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {getStats().map(stat => {
                    const StatIcon = stat.label === "Total" ? ClipboardCheck : stat.label === "Completed" ? CheckCircle : Clock;
                    return (
                        <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                        {stat.label}
                                    </div>
                                    <div className={`mt-1.5 text-3xl font-black leading-none ${stat.color}`}>
                                        {stat.value}
                                    </div>
                                </div>
                                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-700">
                                    <StatIcon className="h-5 w-5" />
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filter Section — only for APPROVER and ADMIN */}
            {["APPROVER", "ADMIN"].includes(currentUser.role) && (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                            <Filter className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-base font-bold text-slate-950">Filter Trips</p>
                            <p className="text-sm text-slate-500">Refine by route, purpose, status, or departure date</p>
                        </div>
                    </div>
                    {isFiltersActive && (
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100"
                        >
                            <X className="h-3.5 w-3.5" /> Clear filters
                        </button>
                    )}
                </div>

                <div className="space-y-4 p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Destination</p>
                        <Select
                            value={searchDestination || "ALL"}
                            onValueChange={(value) => setSearchDestination(value === "ALL" ? "" : value)}
                        >
                            <SelectTrigger className="h-11 rounded-xl bg-white text-sm font-medium text-slate-900">
                                <MapPin className="h-4 w-4 text-slate-400" />
                                <SelectValue placeholder="All destinations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All destinations</SelectItem>
                                {uniqueDestinations.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Purpose</p>
                        <Select
                            value={searchPurpose || "ALL"}
                            onValueChange={(value) => setSearchPurpose(value === "ALL" ? "" : value)}
                        >
                            <SelectTrigger className="h-11 rounded-xl bg-white text-sm font-medium text-slate-900">
                                <SelectValue placeholder="All purposes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All purposes</SelectItem>
                                {uniquePurposes.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Departure Date</p>
                        <input
                            type="date"
                            value={departureDateFilter}
                            onChange={e => setDepartureDateFilter(e.target.value)}
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Status</p>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="h-11 rounded-xl bg-white text-sm font-medium text-slate-900">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
                                        <span className="ml-1 text-xs text-slate-400">
                                            ({status === "ALL" ? trips.length : trips.filter(t => t.status === status).length})
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isFiltersActive && (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                        Showing <span className="font-bold text-slate-900">{filteredTrips.length}</span> of {trips.length} trips
                    </p>
                )}
                </div>
            </div>
            )}

            {/* Trip Cards List */}
            {loading ? (
                <div className="flex justify-center rounded-2xl border border-slate-200 bg-white py-14 shadow-sm">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
            ) : filteredTrips.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
                    <p className="text-base font-bold text-slate-950">No trips found</p>
                    <p className="mt-1 text-sm text-slate-500">Try changing the filters or create a new trip request.</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="vfms-card-header px-5 py-3.5 pl-8">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
                                <ClipboardCheck className="h-5 w-5" />
                            </span>
                            <div>
                                <h2 className="text-lg font-bold text-slate-950">Trip Registry</h2>
                                <p className="text-sm text-slate-500">Operational trip records and booking status</p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[920px]">
                            <thead className="bg-slate-950 text-left text-xs font-bold uppercase tracking-[0.14em] text-white">
                                <tr>
                                    <th className="px-6 py-3.5">Trip</th>
                                    <th className="px-6 py-3.5">Route</th>
                                    <th className="px-6 py-3.5">Schedule</th>
                                    <th className="px-6 py-3.5">Passengers</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredTrips.map(trip => (
                                    <tr
                                        key={trip.id}
                                        className="cursor-pointer transition-colors hover:bg-slate-50"
                                        onClick={() => router.push(`/trips/${trip.id}`)}
                                    >
                                        <td className="px-6 py-3.5">
                                            <p className="font-bold text-slate-950">{trip.purpose}</p>
                                            <p className="mt-1 text-xs font-medium text-slate-500">Trip #{String(trip.id).slice(0, 8)}</p>
                                        </td>
                                        <td className="max-w-[360px] px-6 py-3.5">
                                            <div className="flex items-start gap-2 text-sm font-medium text-slate-600">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                                <span className="line-clamp-2">{formatRoute(trip.destination)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <Calendar className="h-4 w-4 text-slate-400" />
                                                {trip.status === "COMPLETED" && trip.startTime
                                                    ? formatDate(trip.startTime)
                                                    : formatDate(trip.departureTime)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600">
                                                <Users className="h-3.5 w-3.5" />
                                                {trip.passengerCount} pax
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5">{renderStatusBadge(trip.status)}</td>
                                        <td className="px-6 py-3.5">
                                            <div className="flex justify-end">{renderTripActions(trip)}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="space-y-3 p-4 md:hidden">
                        {filteredTrips.map(trip => (
                            <Card
                                key={trip.id}
                                className="cursor-pointer rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-amber-200"
                                onClick={() => router.push(`/trips/${trip.id}`)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1 space-y-3">
                                            {renderStatusBadge(trip.status)}
                                            <p className="text-base font-bold text-slate-950">{trip.purpose}</p>
                                            <div className="flex items-start gap-2 text-sm font-medium text-slate-600">
                                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                                                <span className="break-words">{formatRoute(trip.destination)}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {trip.status === "COMPLETED" && trip.startTime
                                                        ? formatDate(trip.startTime)
                                                        : formatDate(trip.departureTime)}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                                                    <Users className="h-3.5 w-3.5" />
                                                    {trip.passengerCount} pax
                                                </span>
                                            </div>
                                        </div>
                                        {renderTripActions(trip)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
