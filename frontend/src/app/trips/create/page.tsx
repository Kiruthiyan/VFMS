"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowLeft, Loader2, FileText, AlertTriangle } from "lucide-react";
import api from "@/lib/api";
import { useRole } from "@/lib/role-context";

const TripMap = dynamic(() => import("../components/TripMap"), { ssr: false });

const MAX_PASSENGERS = 54;
const MIN_PASSENGERS = 1;

interface FormState {
    purpose: string;
    destination: string;
    departureTime: string;
    returnTime: string;
    passengerCount: string;
    distanceKm: string;
}

interface FormErrors {
    purpose?: string;
    destination?: string;
    departureTime?: string;
    returnTime?: string;
    passengerCount?: string;
    distanceKm?: string;
}

export default function CreateTripPage() {
    const router = useRouter();
    const { currentUser } = useRole();
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [form, setForm] = useState<FormState>({
        purpose: "",
        destination: "",
        departureTime: "",
        returnTime: "",
        passengerCount: "1",
        distanceKm: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const debounceTimer = useRef<any>(null);

    useEffect(() => {
        const handleOutsideClick = () => {
            setShowSuggestions(false);
        };
        window.addEventListener("click", handleOutsideClick);
        return () => window.removeEventListener("click", handleOutsideClick);
    }, []);

    const handleDestChange = (value: string) => {
        setForm(prev => ({ ...prev, destination: value }));
        if (errors.destination) {
            setErrors(prev => ({ ...prev, destination: undefined }));
        }
        setShowSuggestions(true);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            if (!value || value.trim().length < 3) {
                setSuggestions([]);
                return;
            }
            setSuggestionsLoading(true);
            try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`;
                const res = await fetch(url, {
                    headers: { "User-Agent": "VFMS-Fleet-Management-System/1.0" }
                });
                const data = await res.json();
                if (data) {
                    setSuggestions(data.map((item: any) => ({
                        name: item.display_name,
                        lat: parseFloat(item.lat),
                        lon: parseFloat(item.lon)
                    })));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setSuggestionsLoading(false);
            }
        }, 300);
    };

    const nowIso = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        return now.toISOString().slice(0, 16);
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        const now = new Date();

        if (!form.purpose.trim()) {
            newErrors.purpose = "Purpose is required";
        } else if (form.purpose.trim().length < 5) {
            newErrors.purpose = "Purpose must be at least 5 characters";
        }

        if (!form.destination.trim()) {
            newErrors.destination = "Destination is required";
        }

        if (!form.departureTime) {
            newErrors.departureTime = "Departure time is required";
        } else if (new Date(form.departureTime).getTime() < now.getTime() - 15 * 60 * 1000) {
            newErrors.departureTime = "Departure time must be in the future (or present)";
        }

        if (!form.returnTime) {
            newErrors.returnTime = "Return time is required";
        } else if (form.departureTime && new Date(form.returnTime) <= new Date(form.departureTime)) {
            newErrors.returnTime = "Return time must be after departure time";
        }

        const pax = parseInt(form.passengerCount, 10);
        if (!form.passengerCount || isNaN(pax)) {
            newErrors.passengerCount = "Passenger count is required";
        } else if (pax < MIN_PASSENGERS) {
            newErrors.passengerCount = `Minimum ${MIN_PASSENGERS} passenger required`;
        } else if (pax > MAX_PASSENGERS) {
            newErrors.passengerCount = `Maximum ${MAX_PASSENGERS} passengers allowed per trip`;
        }

        if (form.distanceKm && Number(form.distanceKm) <= 0) {
            newErrors.distanceKm = "Distance must be greater than 0";
        }

        console.log("Validation errors:", newErrors);
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError("");

        if (!validate()) return;

        setLoading(true);
        try {
            await api.post("/trips", {
                requesterId: currentUser.id,
                purpose: form.purpose.trim(),
                destination: form.destination.trim(),
                departureTime: form.departureTime,
                returnTime: form.returnTime,
                passengerCount: parseInt(form.passengerCount, 10),
                distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
            });
            router.push("/trips");
        } catch (err: any) {
            setSubmitError(err.response?.data?.message || "Failed to create trip. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fieldClass = (hasError: boolean) =>
        `bg-white text-slate-900 ${hasError ? "border-red-400 focus-visible:ring-red-400" : ""}`;

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto space-y-4">

                <button
                    onClick={() => router.push("/trips")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-0 gap-0 pb-4">
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
                                    Requesting as <span className="font-bold">{currentUser.name}</span>
                                </p>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                            {/* Purpose */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-slate-400" />
                                    Purpose of Trip <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="purpose"
                                    placeholder="e.g. Client meeting in Colombo"
                                    value={form.purpose}
                                    onChange={handleChange}
                                    className={fieldClass(!!errors.purpose)}
                                />
                                {errors.purpose && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {errors.purpose}
                                    </p>
                                )}
                            </div>

                            {/* Destination */}
                            <div className="relative space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    Destination <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    name="destination"
                                    placeholder="e.g. Colombo Fort"
                                    value={form.destination.includes(" -> ") ? form.destination.split(" -> ").pop() : form.destination}
                                    onChange={(e) => handleDestChange(e.target.value)}
                                    className={fieldClass(!!errors.destination)}
                                />
                                {errors.destination && (
                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> {errors.destination}
                                    </p>
                                )}
                                {showSuggestions && (suggestions.length > 0 || suggestionsLoading) && (
                                    <div className="absolute z-[999] left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                        {suggestionsLoading ? (
                                            <div className="p-3 text-xs text-slate-400 flex items-center gap-1.5 justify-center">
                                                <Loader2 className="h-3 w-3 animate-spin text-blue-500" /> Finding places...
                                            </div>
                                        ) : (
                                            suggestions.map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        setForm(prev => ({ ...prev, destination: item.name }));
                                                        setSuggestions([]);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="p-3 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer transition-colors border-b border-slate-100 last:border-0 truncate font-medium flex items-center gap-2"
                                                >
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    {item.name}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Dynamic Route Map & Distance Calculation */}
                            <TripMap
                                destination={form.destination}
                                onDestinationChange={(serialized) => {
                                    setForm(prev => ({ ...prev, destination: serialized }));
                                    if (errors.destination) {
                                        setErrors(prev => ({ ...prev, destination: undefined }));
                                    }
                                }}
                                onDistanceChange={(dist) => {
                                    setForm(prev => ({ ...prev, distanceKm: dist }));
                                    if (errors.distanceKm) {
                                        setErrors(prev => ({ ...prev, distanceKm: undefined }));
                                    }
                                }}
                            />

                            {/* Departure & Return */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        Departure Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="departureTime"
                                        type="datetime-local"
                                        min={nowIso()}
                                        value={form.departureTime}
                                        onChange={handleChange}
                                        className={fieldClass(!!errors.departureTime)}
                                    />
                                    {errors.departureTime && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> {errors.departureTime}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-slate-400" />
                                        Return Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="returnTime"
                                        type="datetime-local"
                                        min={form.departureTime || nowIso()}
                                        value={form.returnTime}
                                        onChange={handleChange}
                                        className={fieldClass(!!errors.returnTime)}
                                    />
                                    {errors.returnTime && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> {errors.returnTime}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Passengers & Distance */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-400" />
                                        Passengers <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="passengerCount"
                                        type="number"
                                        min={MIN_PASSENGERS}
                                        max={MAX_PASSENGERS}
                                        value={form.passengerCount}
                                        onChange={handleChange}
                                        className={fieldClass(!!errors.passengerCount)}
                                    />
                                    <p className="text-xs text-slate-400">Max {MAX_PASSENGERS} passengers</p>
                                    {errors.passengerCount && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> {errors.passengerCount}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">
                                        Distance (km)
                                        <span className="ml-1 text-xs text-blue-600 font-normal">Auto-calculated</span>
                                    </label>
                                    <Input
                                        name="distanceKm"
                                        type="number"
                                        readOnly
                                        placeholder="Enter destination to calculate"
                                        value={form.distanceKm}
                                        className="bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                    />
                                    {errors.distanceKm && (
                                        <p className="text-xs text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> {errors.distanceKm}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Validation errors summary */}
                            {Object.keys(errors).length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-lg space-y-1">
                                    <p className="font-bold flex items-center gap-1.5 text-sm">
                                        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                                        Please correct the errors in the form:
                                    </p>
                                    <ul className="list-disc pl-5 font-semibold space-y-0.5">
                                        {Object.values(errors).filter(Boolean).map((err, idx) => (
                                            <li key={idx}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Submit error */}
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    {submitError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push("/trips")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                >
                                    {loading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
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

