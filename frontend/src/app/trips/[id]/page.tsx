"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    ArrowLeft, Calendar, MapPin, Users, Clock, Star,
    Loader2, CheckCircle, Play, Square, Ban, AlertTriangle,
    ThumbsUp, ThumbsDown, User, Car, AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { useRole } from "@/lib/role-context";
import { queryKeys } from "@/lib/query-keys";

const TripMap = dynamic(() => import("../components/TripMap"), { ssr: false });

interface Trip {
    id: string;
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    status: string;
    passengerCount: number;
    distanceKm: number | null;
    assignedDriverId: string | null;
    assignedVehicleId: string | null;
    requesterId: string;
    approverId: string | null;
    approvalNotes: string | null;
    startTime: string | null;
    endTime: string | null;
    createdAt: string;
    updatedAt: string;
    driverRating?: number | null;
    driverFeedback?: string | null;
    driverTimelineReason?: string | null;
    staffTimelineReason?: string | null;
    stopArrivalTimes?: string | null;
    earlyStartReason?: string | null;
}

interface AssignmentDetails {
    driver?: {
        id: string;
        fullName: string;
        firstName: string;
        lastName: string;
        employeeId: string | null;
    };
    vehicle?: {
        isRental: boolean;
        plateNumber: string | null;
        brand?: string | null;
        model?: string | null;
        color?: string | null;
        vehicleType?: string | null;
    };
}

const STATUS_STYLES: Record<string, string> = {
    NEW:              "bg-slate-50 text-slate-700 border-slate-200 font-bold",
    SUBMITTED:        "bg-amber-50 text-amber-700 border-amber-200 font-bold",
    APPROVED:         "bg-green-50 text-green-700 border-green-200 font-bold",
    DRIVER_CONFIRMED: "bg-teal-50 text-teal-700 border-teal-200 font-bold",
    DRIVER_REJECTED:  "bg-orange-50 text-orange-700 border-orange-200 font-bold",
    START_PENDING:    "bg-yellow-50 text-yellow-700 border-yellow-200 font-bold",
    REJECTED:         "bg-red-50 text-red-700 border-red-200 font-bold",
    ONGOING:          "bg-purple-50 text-purple-700 border-purple-200 font-bold",
    COMPLETED:        "bg-blue-50 text-blue-700 border-blue-200 font-bold",
    CANCELLED:        "bg-slate-100 text-slate-500 border-slate-300 font-bold",
    EXPIRED:          "bg-red-50 text-red-700 border-red-200 font-bold",
};

const TERMINAL_STATUSES = ["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"];

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

export default function TripDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { currentUser } = useRole();

    const [actionLoading, setActionLoading] = useState("");
    const [driverRejectMode, setDriverRejectMode] = useState(false);
    const [driverRejectReason, setDriverRejectReason] = useState("");
    const [error, setError] = useState("");

    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState("");
    const [staffTimelineReason, setStaffTimelineReason] = useState("");
    const [completeReasonMode, setCompleteReasonMode] = useState(false);
    const [completeReason, setCompleteReason] = useState("");
    const [cancelReasonMode, setCancelReasonMode] = useState(false);
    const [cancelReason, setCancelReason] = useState("");

    // Early start reason modal state
    const [earlyStartMode, setEarlyStartMode] = useState(false);
    const [earlyStartReason, setEarlyStartReason] = useState("");

    // Assignment details (enriched driver + vehicle info)
    const [assignmentDetails, setAssignmentDetails] = useState<AssignmentDetails | null>(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [driverProfilePicUrl, setDriverProfilePicUrl] = useState<string | null>(null);

    const {
        data: trip = null,
        isLoading: loading,
        refetch,
    } = useQuery({
        queryKey: queryKeys.trip(id),
        enabled: Boolean(id && id !== "[id]" && id !== "undefined"),
        queryFn: async (): Promise<Trip> => {
            const res = await api.get(`/trips/${id}`);
            return res.data;
        },
    });

    // Fetch enriched assignment details when trip has assignments
    useEffect(() => {
        if (!trip || (!trip.assignedDriverId && !trip.assignedVehicleId)) return;
        setAssignmentLoading(true);
        api.get(`/trips/${id}/assignment-details`)
            .then(res => setAssignmentDetails(res.data))
            .catch(() => setAssignmentDetails(null))
            .finally(() => setAssignmentLoading(false));

        // Fetch driver profile picture
        if (trip.assignedDriverId) {
            api.get(`/drivers/${trip.assignedDriverId}/profile-picture`)
                .then(res => {
                    const url = res.data?.fileUrl;
                    if (url) setDriverProfilePicUrl(url);
                })
                .catch(() => setDriverProfilePicUrl(null));
        }
    }, [trip?.assignedDriverId, trip?.assignedVehicleId, id]);

    const checkReturnDeviation = () => {
        if (!trip) return false;
        const now = new Date();
        const returnTime = new Date(trip.returnTime);
        const diffMs = Math.abs(now.getTime() - returnTime.getTime());
        return diffMs > 30 * 60 * 1000;
    };

    const isEarlyStart = () => {
        if (!trip) return false;
        const now = new Date();
        const departure = new Date(trip.departureTime);
        return now.getTime() < departure.getTime() - 30 * 60 * 1000;
    };

    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    const handleFeedbackSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingFeedback(true);
        setError("");
        try {
            await api.patch(`/trips/${id}/feedback`, {
                rating,
                feedback: feedback.trim(),
                staffTimelineReason: staffTimelineReason.trim()
            });
            await refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const handleAction = async (action: string, body?: object) => {
        setActionLoading(action);
        setError("");
        try {
            if (body) {
                await api.patch(`/trips/${id}/${action}`, body);
            } else {
                await api.patch(`/trips/${id}/${action}`);
            }
            await refetch();
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to ${action} trip`);
        } finally {
            setActionLoading("");
        }
    };

    const handleDriverReject = async () => {
        if (driverRejectReason.trim().length < 10) {
            setError("Please provide a reason of at least 10 characters");
            return;
        }
        await handleAction("driver-reject", { notes: driverRejectReason });
        setDriverRejectMode(false);
        setDriverRejectReason("");
    };

    const handleStartTrip = () => {
        if (isEarlyStart()) {
            setEarlyStartMode(true);
        } else {
            handleAction("start");
        }
    };

    const handleEarlyStartConfirm = async () => {
        if (earlyStartReason.trim().length < 10) {
            setError("Early start reason must be at least 10 characters");
            return;
        }
        await handleAction("start", { reason: earlyStartReason });
        setEarlyStartMode(false);
        setEarlyStartReason("");
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
    );

    if (!trip) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <p className="text-slate-500">Trip not found.</p>
        </div>
    );

    const isDriverRejectedNote = trip.approvalNotes?.startsWith("Driver rejected:");

    // Stop arrival validation
    const stops = trip.destination?.split(" -> ") ?? [];
    const expectedStops = Math.max(0, stops.length - 2);
    const loggedStops = trip.stopArrivalTimes
        ? trip.stopArrivalTimes.split(",").filter((t: string) => t.trim()).length
        : 0;
    const stopsAllLogged = expectedStops === 0 || loggedStops >= expectedStops;

    return (
        <div className="vfms-detail-page">
            <div className="vfms-detail-container max-w-7xl space-y-6">

                <button
                    onClick={() => router.push("/trips")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <Card className="vfms-detail-card">
                    <CardHeader className="vfms-form-header px-6 py-5 pl-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-blue-950">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-white text-lg font-bold">Trip Details</CardTitle>
                                </div>
                            </div>
                            <Badge variant="outline" className={STATUS_STYLES[trip.status] ?? "font-bold"}>
                                {trip.status.replace(/_/g, " ")}
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-5">

                        {/* Purpose */}
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
                            <p className="text-slate-900 font-medium">{trip.purpose}</p>
                        </div>

                        {/* Destination Itinerary Timeline */}
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itinerary Route</p>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
                                {trip.destination.split(" -> ").map((place: string, idx: number, arr: string[]) => {
                                    const isStop = idx > 0 && idx < arr.length - 1;
                                    const arrivalTimes = trip.stopArrivalTimes ? trip.stopArrivalTimes.split(",") : [];
                                    const loggedTime = isStop && arrivalTimes[idx - 1] ? arrivalTimes[idx - 1] : null;
                                    return (
                                        <div key={idx} className="flex gap-4 relative last:pb-0 pb-4">
                                            {idx < arr.length - 1 && (
                                                <div className="absolute left-[9px] top-6 bottom-0 w-0.5 bg-slate-200" />
                                            )}
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 z-10 text-[10px] font-black text-white ${
                                                idx === 0 ? "bg-[#10B981]" :
                                                idx === arr.length - 1 ? "bg-[#EF4444]" :
                                                "bg-[#8B5CF6]"
                                            }`}>
                                                {idx === 0 ? "A" : idx === arr.length - 1 ? "B" : idx}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {idx === 0 ? "Start Location" : idx === arr.length - 1 ? "Final Destination" : `Stop ${idx}`}
                                                </p>
                                                <p className="text-slate-800 text-sm font-semibold mt-0.5 truncate" title={place}>{place}</p>
                                                {isStop && loggedTime && (
                                                    <p className="text-[11px] text-green-600 font-medium mt-1">
                                                        ✓ Arrived at: {new Date(loggedTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                                                    </p>
                                                )}
                                                {isStop && !loggedTime && trip.status === "ONGOING" && currentUser.role === "DRIVER" && trip.assignedDriverId === currentUser.id && idx === arrivalTimes.length + 1 && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction("log-stop")}
                                                        disabled={actionLoading === "log-stop"}
                                                        className="mt-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] h-7 px-3 py-1 font-bold rounded-lg shadow-sm"
                                                    >
                                                        {actionLoading === "log-stop" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                                                        Log Arrival at Stop {idx}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Interactive Route Map */}
                        <div className="mt-2">
                            <TripMap destination={trip.destination} viewOnly={true} mapHeight="h-[480px]" />
                        </div>

                        {/* Times */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="vfms-detail-tile">
                                <Calendar className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Departure</p>
                                    <p className="text-slate-900 font-medium text-sm">{formatDate(trip.departureTime)}</p>
                                </div>
                            </div>
                            <div className="vfms-detail-tile">
                                <Clock className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Return</p>
                                    <p className="text-slate-900 font-medium text-sm">{formatDate(trip.returnTime)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Passengers & Distance */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="vfms-detail-tile">
                                <Users className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Passengers</p>
                                    <p className="text-slate-900 font-medium">{trip.passengerCount}</p>
                                </div>
                            </div>
                            {trip.distanceKm && (
                                <div className="vfms-detail-tile">
                                    <MapPin className="h-4 w-4 text-blue-950 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Distance</p>
                                        <p className="text-slate-900 font-medium">{trip.distanceKm} km</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Enriched Assignment Details */}
                        {(trip.assignedDriverId || trip.assignedVehicleId) && (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assignments</p>
                                {assignmentLoading && (
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Loading details...
                                    </div>
                                )}
                                {/* Driver Card */}
                                {trip.assignedDriverId && (
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                        <div className="w-11 h-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                                            {driverProfilePicUrl ? (
                                                <img src={driverProfilePicUrl} alt="Driver" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="h-5 w-5 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Driver</p>
                                            <p className="text-slate-900 font-semibold text-sm truncate">
                                                {assignmentDetails?.driver?.fullName ?? "Loading…"}
                                            </p>
                                            {assignmentDetails?.driver?.employeeId && (
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    ID: {assignmentDetails.driver.employeeId}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {/* Vehicle Card */}
                                {trip.assignedVehicleId && (
                                    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                            <Car className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                                                Vehicle {assignmentDetails?.vehicle?.isRental ? "(Rental)" : ""}
                                            </p>
                                            {assignmentDetails?.vehicle ? (
                                                assignmentDetails.vehicle.isRental ? (
                                                    <>
                                                        <p className="text-slate-900 font-semibold text-sm">{assignmentDetails.vehicle.vehicleType}</p>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{assignmentDetails.vehicle.plateNumber}</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-slate-900 font-semibold text-sm">
                                                            {[assignmentDetails.vehicle.brand, assignmentDetails.vehicle.model].filter(Boolean).join(" ")}
                                                            {assignmentDetails.vehicle.color ? ` · ${assignmentDetails.vehicle.color}` : ""}
                                                        </p>
                                                        <p className="text-xs text-slate-500 font-medium mt-0.5">{assignmentDetails.vehicle.plateNumber}</p>
                                                    </>
                                                )
                                            ) : (
                                                <p className="text-slate-500 text-sm">Loading…</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Trip timestamps for ongoing/completed */}
                        {(trip.startTime || trip.endTime) && (
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-2">
                                <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">Trip Timeline</p>
                                {trip.startTime && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                                        <span className="text-slate-500 font-medium w-24">Trip Started</span>
                                        <span className="text-slate-900 font-semibold">{formatDate(trip.startTime)}</span>
                                    </div>
                                )}
                                {trip.endTime && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                        <span className="text-slate-500 font-medium w-24">Trip Ended</span>
                                        <span className="text-slate-900 font-semibold">{formatDate(trip.endTime)}</span>
                                    </div>
                                )}
                                {trip.earlyStartReason && (
                                    <div className="flex items-start gap-3 text-sm mt-1">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0 mt-1" />
                                        <div>
                                            <span className="text-slate-500 font-medium block text-xs uppercase tracking-wider mb-0.5">Early Start Reason</span>
                                            <span className="text-slate-700 italic">"{trip.earlyStartReason}"</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Driver Feedback Section (Only for COMPLETED trips) */}
                        {trip.status === "COMPLETED" && (
                            <div className="border-t border-slate-100 pt-5 space-y-4">
                                {trip.driverRating ? (
                                    /* Read-only Feedback Summary */
                                    <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-3">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Driver Performance Feedback</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-slate-500 font-semibold text-sm">Rating:</span>
                                            <div className="flex text-amber-400">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4.5 w-4.5 fill-current ${
                                                            i < (trip.driverRating ?? 0) ? "text-amber-400" : "text-slate-200"
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="font-bold text-slate-700 text-sm ml-1">({trip.driverRating} / 5)</span>
                                        </div>
                                        {trip.driverFeedback && (
                                            <div className="bg-white border border-slate-100 rounded-xl p-3.5 text-slate-700 text-sm italic font-medium shadow-sm">
                                                "{trip.driverFeedback}"
                                            </div>
                                        )}
                                        {trip.driverTimelineReason && (
                                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3.5 text-slate-700 text-sm font-medium mt-2">
                                                <span className="font-bold text-orange-800 uppercase tracking-wider text-[10px] block mb-1">Driver Time Change Reason:</span>
                                                "{trip.driverTimelineReason}"
                                            </div>
                                        )}
                                        {trip.staffTimelineReason && (
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 text-slate-700 text-sm font-medium mt-2">
                                                <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px] block mb-1">Staff Time Change Reason:</span>
                                                "{trip.staffTimelineReason}"
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* Interactive Feedback Form (only for Requester / System User) */
                                    currentUser.role === "SYSTEM_USER" && currentUser.id === trip.requesterId && (() => {
                                        const endDeviates = trip.endTime ? (
                                            Math.abs(new Date(trip.endTime).getTime() - new Date(trip.returnTime).getTime()) > 30 * 60 * 1000
                                        ) : false;
                                        return (
                                            <form onSubmit={handleFeedbackSubmit} className="bg-blue-50/40 border border-blue-200/60 rounded-2xl p-5 space-y-4">
                                                <div>
                                                    <p className="text-sm font-bold text-blue-950">Rate your Driver</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Please rate your experience with the driver for this completed trip.</p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Rating:</span>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                type="button"
                                                                onClick={() => setRating(star)}
                                                                className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                                                            >
                                                                <Star className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Comments / Feedback</label>
                                                    <textarea
                                                        placeholder="Tell us about the driver (safe driving, punctuality, politeness)..."
                                                        value={feedback}
                                                        onChange={(e) => setFeedback(e.target.value)}
                                                        rows={3}
                                                        className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                    />
                                                </div>

                                                {endDeviates && (
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                                                            Timeline Deviation Reason <span className="text-red-500">*</span>
                                                        </label>
                                                        <textarea
                                                            placeholder="The trip ended outside the scheduled return window. Please explain..."
                                                            value={staffTimelineReason}
                                                            onChange={(e) => setStaffTimelineReason(e.target.value)}
                                                            rows={2}
                                                            className="flex w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                                        />
                                                    </div>
                                                )}

                                                <Button
                                                    type="submit"
                                                    disabled={submittingFeedback || (endDeviates && !staffTimelineReason.trim())}
                                                    className="w-full"
                                                >
                                                    {submittingFeedback ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                    Submit Feedback
                                                </Button>
                                            </form>
                                        );
                                    })()
                                )}
                            </div>
                        )}

                        {/* Approval / Driver rejection notes */}
                        {trip.approvalNotes && (
                            <div className={`border rounded-lg p-4 ${
                                isDriverRejectedNote
                                    ? "bg-orange-50 border-orange-200"
                                    : "bg-amber-50 border-amber-200"
                            }`}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                                    isDriverRejectedNote ? "text-orange-600" : "text-amber-600"
                                }`}>
                                    {isDriverRejectedNote ? "Driver Rejection Reason" : "Notes"}
                                </p>
                                <p className="text-sm text-slate-700">{trip.approvalNotes}</p>
                                {isDriverRejectedNote && (
                                    <p className="text-xs text-orange-500 mt-2 font-medium">
                                        Staff needs to assign a different driver.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div className="border-t border-slate-100" />

                        {/* Contextual status info */}
                        {["APPROVER", "ADMIN"].includes(currentUser.role) && trip.status === "NEW" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-700">Waiting for user submission</p>
                                    <p className="text-xs text-amber-600 mt-0.5">
                                        This trip is still with the requester. Admin can submit it directly below.
                                    </p>
                                </div>
                            </div>
                        )}
                        {["APPROVER", "ADMIN"].includes(currentUser.role) && trip.status === "APPROVED" && (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-teal-700">Awaiting driver confirmation</p>
                                    <p className="text-xs text-teal-600 mt-0.5">
                                        Driver has been assigned. Waiting for them to accept or reject the assignment.
                                    </p>
                                </div>
                            </div>
                        )}
                        {currentUser.role === "DRIVER" && trip.status === "DRIVER_CONFIRMED" && (
                            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
                                <CheckCircle className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-teal-700">You have accepted this trip</p>
                                    <p className="text-xs text-teal-600 mt-0.5">Click Start Trip when you are ready to begin.</p>
                                </div>
                            </div>
                        )}
                        {/* START_PENDING — driver's view */}
                        {currentUser.role === "DRIVER" && trip.status === "START_PENDING" && trip.assignedDriverId === currentUser.id && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                                <Clock className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-yellow-700">Awaiting passenger confirmation</p>
                                    <p className="text-xs text-yellow-600 mt-0.5">
                                        The requester has been notified. Waiting for them to confirm all passengers are onboard.
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* START_PENDING — requester / admin view */}
                        {["SYSTEM_USER", "ADMIN"].includes(currentUser.role) && trip.status === "START_PENDING" && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-yellow-700">Driver has requested to start the trip</p>
                                    <p className="text-xs text-yellow-600 mt-0.5">
                                        Confirm that all passengers are inside the vehicle before the trip begins.
                                    </p>
                                    {trip.earlyStartReason && (
                                        <p className="text-xs text-yellow-700 mt-1.5 font-medium italic">
                                            Early start reason: "{trip.earlyStartReason}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* EXPIRED info */}
                        {trip.status === "EXPIRED" && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-red-700">Trip has expired</p>
                                    <p className="text-xs text-red-600 mt-0.5">
                                        Departure window has passed without the trip being started.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 font-semibold">

                            {/* System User: edit & submit */}
                            {currentUser.role === "SYSTEM_USER" && trip.status === "NEW" && (
                                <>
                                    <Button
                                        onClick={() => router.push(`/trips/${id}/edit`)}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Edit Trip
                                    </Button>
                                    <Button
                                        onClick={() => handleAction("submit")}
                                        disabled={actionLoading === "submit"}
                                        className="flex-1"
                                    >
                                        {actionLoading === "submit"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : "Submit for Approval"}
                                    </Button>
                                </>
                            )}

                            {/* ADMIN: submit NEW trips directly */}
                            {currentUser.role === "ADMIN" && trip.status === "NEW" && (
                                <Button
                                    onClick={() => handleAction("submit")}
                                    disabled={actionLoading === "submit"}
                                    className="flex-1"
                                >
                                    {actionLoading === "submit"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : "Submit for Approval"}
                                </Button>
                            )}

                            {/* Staff / Admin: review & approve (also for driver-rejected trips) */}
                            {["APPROVER", "ADMIN"].includes(currentUser.role) &&
                                ["SUBMITTED", "DRIVER_REJECTED"].includes(trip.status) && (
                                <Button
                                    onClick={() => router.push(`/trips/${id}/approve`)}
                                    className="flex-1"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {trip.status === "DRIVER_REJECTED" ? "Reassign Driver & Vehicle" : "Review & Approve"}
                                </Button>
                            )}

                            {/* Requester / ADMIN: confirm passenger onboard (START_PENDING) */}
                            {["SYSTEM_USER", "ADMIN"].includes(currentUser.role) && trip.status === "START_PENDING" && (
                                <Button
                                    onClick={() => handleAction("confirm-start")}
                                    disabled={actionLoading === "confirm-start"}
                                    variant="success"
                                    className="flex-1"
                                >
                                    {actionLoading === "confirm-start"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><CheckCircle className="mr-2 h-4 w-4" /> Confirm Passenger Onboard</>}
                                </Button>
                            )}

                            {/* Driver: accept or reject the assignment */}
                            {currentUser.role === "DRIVER" && trip.status === "APPROVED" &&
                                trip.assignedDriverId === currentUser.id && (
                                <>
                                    {!driverRejectMode ? (
                                        <>
                                            <Button
                                                onClick={() => handleAction("driver-accept")}
                                                disabled={actionLoading === "driver-accept"}
                                                variant="success"
                                                className="flex-1"
                                            >
                                                {actionLoading === "driver-accept"
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <><ThumbsUp className="mr-2 h-4 w-4" /> Accept Assignment</>}
                                            </Button>
                                            <Button
                                                onClick={() => setDriverRejectMode(true)}
                                                variant="outline"
                                                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                                            >
                                                <ThumbsDown className="mr-2 h-4 w-4" /> Reject Assignment
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="w-full space-y-3">
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                                                <p className="text-xs font-bold text-orange-700 mb-1">
                                                    Rejection Reason <span className="text-red-500">*</span>
                                                </p>
                                                <textarea
                                                    placeholder="Explain why you cannot accept this trip..."
                                                    value={driverRejectReason}
                                                    onChange={e => setDriverRejectReason(e.target.value)}
                                                    rows={3}
                                                    className="flex w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                                                />
                                                <p className={`text-xs mt-1 ${driverRejectReason.trim().length >= 10 ? "text-green-600" : "text-slate-400"}`}>
                                                    {driverRejectReason.trim().length} / 10 chars minimum
                                                </p>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => { setDriverRejectMode(false); setDriverRejectReason(""); setError(""); }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={handleDriverReject}
                                                    disabled={actionLoading === "driver-reject" || driverRejectReason.trim().length < 10}
                                                    variant="destructive"
                                                    className="flex-1 disabled:opacity-50"
                                                >
                                                    {actionLoading === "driver-reject"
                                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                                        : "Confirm Rejection"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Driver: start confirmed trip */}
                            {currentUser.role === "DRIVER" && trip.status === "DRIVER_CONFIRMED" && trip.assignedDriverId === currentUser.id && (
                                <Button
                                    onClick={handleStartTrip}
                                    disabled={actionLoading === "start"}
                                    className="flex-1"
                                >
                                    {actionLoading === "start"
                                        ? <Loader2 className="h-4 w-4 animate-spin" />
                                        : <><Play className="mr-2 h-4 w-4" /> Start Trip</>}
                                </Button>
                            )}

                            {/* Driver: complete ongoing trip */}
                            {currentUser.role === "DRIVER" && trip.status === "ONGOING" && trip.assignedDriverId === currentUser.id && (
                                <>
                                    {!stopsAllLogged && (
                                        <div className="w-full bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                                            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-xs text-amber-700 font-medium">
                                                Please log arrival at all intermediate stops ({loggedStops}/{expectedStops} logged) before completing the trip.
                                            </p>
                                        </div>
                                    )}
                                    <Button
                                        onClick={() => {
                                            if (checkReturnDeviation()) {
                                                setCompleteReasonMode(true);
                                            } else {
                                                handleAction("complete");
                                            }
                                        }}
                                        disabled={actionLoading === "complete" || !stopsAllLogged}
                                        variant="success"
                                        className="flex-1 disabled:opacity-50"
                                    >
                                        {actionLoading === "complete"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <><Square className="mr-2 h-4 w-4" /> Complete Trip</>}
                                    </Button>

                                    <Dialog open={completeReasonMode} onOpenChange={(open) => {
                                        if (!open) {
                                            setCompleteReasonMode(false);
                                            setCompleteReason("");
                                        }
                                    }}>
                                        <DialogContent>
                                            <DialogHeader className="vfms-form-header rounded-t-xl px-6 py-5 pl-8">
                                                <DialogTitle>Timeline Deviation Reason</DialogTitle>
                                                <DialogDescription>
                                                    You are ending this trip more than 30 minutes early or late compared to the scheduled return time ({formatDate(trip.returnTime)}). Please provide a reason for the change.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <textarea
                                                    placeholder="e.g. Completed early due to light traffic / Delayed due to vehicle inspection..."
                                                    value={completeReason}
                                                    onChange={e => setCompleteReason(e.target.value)}
                                                    rows={3}
                                                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => { setCompleteReasonMode(false); setCompleteReason(""); }}>Cancel</Button>
                                                <Button
                                                    variant="success"
                                                    className="font-bold"
                                                    disabled={!completeReason.trim() || actionLoading === "complete"}
                                                    onClick={async () => {
                                                        await handleAction("complete", { reason: completeReason });
                                                        setCompleteReasonMode(false);
                                                        setCompleteReason("");
                                                    }}
                                                >
                                                    {actionLoading === "complete" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                    Complete Trip
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}

                            {/* Cancel — only SYSTEM_USER and ADMIN, not STAFF or DRIVER */}
                            {["SYSTEM_USER", "ADMIN"].includes(currentUser.role) &&
                                !TERMINAL_STATUSES.includes(trip.status) && (
                                <>
                                    <Button
                                        onClick={() => setCancelReasonMode(true)}
                                        disabled={actionLoading === "cancel"}
                                        variant="outline"
                                        className="border-red-200 text-red-600 hover:bg-red-50"
                                    >
                                        {actionLoading === "cancel"
                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                            : <><Ban className="mr-2 h-4 w-4" /> Cancel</>}
                                    </Button>

                                    <Dialog open={cancelReasonMode} onOpenChange={(open) => {
                                        if (!open) {
                                            setCancelReasonMode(false);
                                            setCancelReason("");
                                        }
                                    }}>
                                        <DialogContent>
                                            <DialogHeader className="vfms-form-header rounded-t-xl px-6 py-5 pl-8">
                                                <DialogTitle>Cancel Trip Request</DialogTitle>
                                                <DialogDescription>
                                                    Please provide a reason for canceling this trip request. This action cannot be undone.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <textarea
                                                    placeholder="Reason for cancellation..."
                                                    value={cancelReason}
                                                    onChange={e => setCancelReason(e.target.value)}
                                                    rows={3}
                                                    className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 resize-none font-medium"
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => { setCancelReasonMode(false); setCancelReason(""); }}>Go Back</Button>
                                                <Button
                                                    variant="destructive"
                                                    disabled={!cancelReason.trim() || actionLoading === "cancel"}
                                                    onClick={async () => {
                                                        await handleAction("cancel", { notes: cancelReason, approverId: currentUser.id });
                                                        setCancelReasonMode(false);
                                                        setCancelReason("");
                                                    }}
                                                >
                                                    {actionLoading === "cancel" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                    Confirm Cancel
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </>
                            )}
                        </div>

                        {/* Early Start Reason Modal */}
                        <Dialog open={earlyStartMode} onOpenChange={(open) => {
                            if (!open) { setEarlyStartMode(false); setEarlyStartReason(""); setError(""); }
                        }}>
                            <DialogContent>
                                <DialogHeader className="vfms-form-header rounded-t-xl px-6 py-5 pl-8">
                                    <DialogTitle>Early Start Reason Required</DialogTitle>
                                    <DialogDescription>
                                        You are starting this trip more than 30 minutes before the scheduled departure ({formatDate(trip.departureTime)}). Please provide a reason.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <textarea
                                        placeholder="e.g. Passenger requested early pickup due to flight schedule..."
                                        value={earlyStartReason}
                                        onChange={e => setEarlyStartReason(e.target.value)}
                                        rows={3}
                                        className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
                                    />
                                    <p className={`text-xs mt-1.5 ${earlyStartReason.trim().length >= 10 ? "text-green-600" : "text-slate-400"}`}>
                                        {earlyStartReason.trim().length} / 10 chars minimum
                                    </p>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => { setEarlyStartMode(false); setEarlyStartReason(""); }}>Cancel</Button>
                                    <Button
                                        className="font-bold"
                                        disabled={earlyStartReason.trim().length < 10 || actionLoading === "start"}
                                        onClick={handleEarlyStartConfirm}
                                    >
                                        {actionLoading === "start" && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                        Start Trip Early
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
