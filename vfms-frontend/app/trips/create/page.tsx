"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowLeft, Loader2, FileText } from "lucide-react";
import api from "@/lib/api";

export default function CreateTripPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        purpose: "",
        destination: "",
        departureTime: "",
        returnTime: "",
        passengerCount: 1,
        distanceKm: "",
    });

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

        setLoading(true);
        try {
            await api.post("/trips", {
                ...form,
                requesterId: "00000000-0000-0000-0000-000000000001",
                passengerCount: Number(form.passengerCount),
                distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
            });
            router.push("/trips");
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">

                {/* Back button */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Card Header */}
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-white text-lg font-bold">
                                    New Trip Request
                                </CardTitle>
                                <p className="text-blue-200 text-sm mt-0.5">
                                    Fill in the details to submit a trip request
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Purpose */}
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

                            {/* Destination */}
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

                            {/* Date/Time row */}
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

                            {/* Passengers and Distance row */}
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

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            {/* Buttons */}
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
                                    disabled={loading}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Trip Request"
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