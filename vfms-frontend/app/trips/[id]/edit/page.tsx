"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, Users, Loader2, FileText } from "lucide-react";
import api from "@/lib/api";

interface Trip {
    id: string;
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    passengerCount: number;
    distanceKm: number | null;
    status: string;
}

const toDateTimeLocal = (dateStr: string) => {
    const d = new Date(dateStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function EditTripPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        purpose: "",
        destination: "",
        departureTime: "",
        returnTime: "",
        passengerCount: 1,
        distanceKm: "",
    });

    useEffect(() => {
        fetchTrip();
    }, [id]);

    const fetchTrip = async () => {
        try {
            const res = await api.get(`/trips/${id}`);
            const trip: Trip = res.data;

            if (trip.status !== "NEW") {
                alert("Only NEW trips can be edited");
                router.push(`/trips/${id}`);
                return;
            }

            setForm({
                purpose: trip.purpose,
                destination: trip.destination,
                departureTime: toDateTimeLocal(trip.departureTime),
                returnTime: toDateTimeLocal(trip.returnTime),
                passengerCount: trip.passengerCount,
                distanceKm: trip.distanceKm ? String(trip.distanceKm) : "",
            });
        } catch (err) {
            console.error("Failed to fetch trip", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (new Date(form.returnTime) <= new Date(form.departureTime)) {
            setError("Return time must be after departure time");
            return;
        }

        setSaving(true);
        try {
            await api.put(`/trips/${id}`, {
                ...form,
                requesterId: "00000000-0000-0000-0000-000000000001",
                passengerCount: Number(form.passengerCount),
                distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
            });
            router.push(`/trips/${id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to update trip");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back
                </button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-lg font-bold">
                                    Edit Trip Request
                                </CardTitle>
                                <p className="text-blue-200 text-sm mt-0.5">
                                    Update the trip details below
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    Purpose of Trip
                                </label>
                                <Input
                                    name="purpose"
                                    placeholder="e.g. Client meeting in Colombo"
                                    value={form.purpose}
                                    onChange={handleChange}
                                    required
                                    className="bg-white text-slate-900"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    Destination
                                </label>
                                <Input
                                    name="destination"
                                    placeholder="e.g. Colombo Fort"
                                    value={form.destination}
                                    onChange={handleChange}
                                    required
                                    className="bg-white text-slate-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        Departure Time
                                    </label>
                                    <Input
                                        name="departureTime"
                                        type="datetime-local"
                                        value={form.departureTime}
                                        onChange={handleChange}
                                        required
                                        className="bg-white text-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        Return Time
                                    </label>
                                    <Input
                                        name="returnTime"
                                        type="datetime-local"
                                        value={form.returnTime}
                                        onChange={handleChange}
                                        required
                                        className="bg-white text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        Passenger Count
                                    </label>
                                    <Input
                                        name="passengerCount"
                                        type="number"
                                        min={1}
                                        value={form.passengerCount}
                                        onChange={handleChange}
                                        required
                                        className="bg-white text-slate-900"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Distance (km) — optional
                                    </label>
                                    <Input
                                        name="distanceKm"
                                        type="number"
                                        min={0}
                                        step="0.1"
                                        placeholder="e.g. 25.5"
                                        value={form.distanceKm}
                                        onChange={handleChange}
                                        className="bg-white text-slate-900"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}