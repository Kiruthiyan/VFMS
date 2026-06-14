"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, ArrowLeft, Loader2, FileText, AlertTriangle, Plus, Trash2, Navigation } from "lucide-react";
import api from "@/lib/api";
import { useRole } from "@/lib/roleContext";
import AddressSearchInput from "@/components/trips/AddressSearchInput";

// Dynamically import Leaflet MapComponent with SSR disabled
const MapComponent = dynamic(() => import("@/components/trips/MapComponent"), { ssr: false });

const MAX_PASSENGERS = 54;
const MIN_PASSENGERS = 1;

interface StopState {
    address: string;
    coords: { lat: number; lng: number } | null;
}

interface FormState {
    purpose: string;
    departureTime: string;
    returnTime: string;
    passengerCount: string;
    distanceKm: string;
}

interface FormErrors {
    purpose?: string;
    startPoint?: string;
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
    
    // Form simple values
    const [form, setForm] = useState<FormState>({
        purpose: "",
        departureTime: "",
        returnTime: "",
        passengerCount: "1",
        distanceKm: "",
    });

    // Start coordinates and address. Defaults to Base coordinates [6.7912, 79.9005]
    const [startAddress, setStartAddress] = useState("VFMS Base Office, Moratuwa");
    const [startCoords, setStartCoords] = useState({ lat: 6.7912, lng: 79.9005 });

    // Dynamic intermediate stops
    const [stops, setStops] = useState<StopState[]>([]);

    // End/Destination coordinates and address
    const [destAddress, setDestAddress] = useState("");
    const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Duration state
    const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

    const [errors, setErrors] = useState<FormErrors>({});

    const nowIso = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        return now.toISOString().slice(0, 16);
    };

    const getCombinedDestinationString = () => {
        const startStr = startAddress || "Base Office";
        const stopsStr = stops
            .map(s => s.address)
            .filter(Boolean)
            .map(addr => ` -> ${addr}`)
            .join("");
        const destStr = destAddress ? ` -> ${destAddress}` : "";
        return `${startStr}${stopsStr}${destStr}`;
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        const now = new Date();

        if (!form.purpose.trim()) {
            newErrors.purpose = "Purpose is required";
        } else if (form.purpose.trim().length < 5) {
            newErrors.purpose = "Purpose must be at least 5 characters";
        }

        if (!startAddress.trim() || !startCoords) {
            newErrors.startPoint = "Valid starting point is required";
        }

        if (!destAddress.trim() || !destCoords) {
            newErrors.destination = "Valid destination is required";
        }

        if (!form.departureTime) {
            newErrors.departureTime = "Departure time is required";
        } else if (new Date(form.departureTime) <= now) {
            newErrors.departureTime = "Departure time must be in the future";
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

    const handleRouteCalculated = (distanceKm: number, durationSec: number) => {
        setForm(prev => ({ ...prev, distanceKm: distanceKm.toString() }));
        setDurationSeconds(durationSec);
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "";
        const minsTotal = Math.round(seconds / 60);
        const hrs = Math.floor(minsTotal / 60);
        const mins = minsTotal % 60;
        if (hrs > 0) {
            return `${hrs} hr${hrs > 1 ? "s" : ""} ${mins} min${mins > 1 ? "s" : ""}`;
        }
        return `${mins} min${mins > 1 ? "s" : ""}`;
    };

    const addStop = () => {
        setStops(prev => [...prev, { address: "", coords: null }]);
    };

    const removeStop = (index: number) => {
        setStops(prev => prev.filter((_, idx) => idx !== index));
    };

    const updateStopAddress = (index: number, val: string) => {
        setStops(prev => prev.map((s, idx) => idx === index ? { ...s, address: val } : s));
    };

    const handleSelectStopLocation = (index: number, lat: number, lng: number, name: string) => {
        setStops(prev => prev.map((s, idx) => idx === index ? { coords: { lat, lng }, address: name } : s));
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
                destination: getCombinedDestinationString(),
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

    // Construct valid coordinates array for MapComponent
    const mapLocations = [
        { lat: startCoords.lat, lng: startCoords.lng, name: startAddress || "Start" },
        ...stops.map((s, i) => ({
            lat: s.coords?.lat || 0,
            lng: s.coords?.lng || 0,
            name: s.address || `Stop ${i + 1}`
        })),
        ...(destCoords ? [{
            lat: destCoords.lat,
            lng: destCoords.lng,
            name: destAddress || "Destination"
        }] : [])
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-4">
                <button
                    onClick={() => router.push("/trips")}
                    className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Trips
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Booking Form */}
                    <div className="lg:col-span-7">
                        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden pb-4">
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
                                            placeholder="e.g. Client meeting in Galle"
                                            value={form.purpose}
                                            onChange={handleChange}
                                            className={`bg-white text-slate-900 ${
                                                errors.purpose ? "border-red-400 focus-visible:ring-red-400" : "border-slate-200 focus-visible:ring-blue-950"
                                            }`}
                                        />
                                        {errors.purpose && (
                                            <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                                                <AlertTriangle className="h-3 w-3" /> {errors.purpose}
                                            </p>
                                        )}
                                    </div>

                                    {/* Starting Point (Searchable) */}
                                    <AddressSearchInput
                                        label="Starting Point"
                                        placeholder="Enter starting location"
                                        value={startAddress}
                                        onChange={setStartAddress}
                                        onSelectLocation={(lat, lng, name) => {
                                            setStartCoords({ lat, lng });
                                            setStartAddress(name);
                                        }}
                                        icon={<Navigation className="h-4 w-4 text-slate-400" />}
                                        error={errors.startPoint}
                                        required
                                    />

                                    {/* Intermediate Stops */}
                                    <div className="space-y-3 pt-1 border-t border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-slate-700">Route Stops (Waypoints)</span>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addStop}
                                                className="h-8 text-xs flex items-center gap-1 border-slate-200 text-slate-600 hover:text-slate-900"
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add Stop
                                            </Button>
                                        </div>

                                        {stops.map((stop, index) => (
                                            <div key={index} className="flex gap-2 items-end bg-slate-50 p-3 rounded-lg border border-slate-100 relative group">
                                                <div className="flex-1">
                                                    <AddressSearchInput
                                                        label={`Stop ${index + 1}`}
                                                        placeholder="Enter waypoint address"
                                                        value={stop.address}
                                                        onChange={(val) => updateStopAddress(index, val)}
                                                        onSelectLocation={(lat, lng, name) => handleSelectStopLocation(index, lat, lng, name)}
                                                        icon={<MapPin className="h-4 w-4 text-amber-500" />}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeStop(index)}
                                                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 mb-0.5 shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Destination */}
                                    <AddressSearchInput
                                        label="Final Destination"
                                        placeholder="Enter final destination"
                                        value={destAddress}
                                        onChange={setDestAddress}
                                        onSelectLocation={(lat, lng, name) => {
                                            setDestCoords({ lat, lng });
                                            setDestAddress(name);
                                        }}
                                        icon={<MapPin className="h-4 w-4 text-red-500" />}
                                        error={errors.destination}
                                        required
                                    />

                                    {/* Departure & Return Times */}
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
                                                className={`bg-white text-slate-900 border border-slate-200 focus-visible:ring-blue-950 ${
                                                    errors.departureTime ? "border-red-400 focus-visible:ring-red-400" : ""
                                                }`}
                                            />
                                            {errors.departureTime && (
                                                <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
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
                                                className={`bg-white text-slate-900 border border-slate-200 focus-visible:ring-blue-950 ${
                                                    errors.returnTime ? "border-red-400 focus-visible:ring-red-400" : ""
                                                }`}
                                            />
                                            {errors.returnTime && (
                                                <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                                                    <AlertTriangle className="h-3 w-3" /> {errors.returnTime}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Passengers & Calculated Distance */}
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
                                                className={`bg-white text-slate-900 border border-slate-200 focus-visible:ring-blue-950 ${
                                                    errors.passengerCount ? "border-red-400 focus-visible:ring-red-400" : ""
                                                }`}
                                            />
                                            <p className="text-xs text-slate-400">Max {MAX_PASSENGERS} passengers</p>
                                            {errors.passengerCount && (
                                                <p className="text-xs text-red-500 flex items-center gap-1 font-medium mt-1">
                                                    <AlertTriangle className="h-3 w-3" /> {errors.passengerCount}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-700">
                                                Calculated Distance (km)
                                            </label>
                                            <Input
                                                name="distanceKm"
                                                type="number"
                                                readOnly
                                                placeholder="Auto-calculated from map"
                                                value={form.distanceKm}
                                                className="bg-slate-50 text-slate-600 border border-slate-200 cursor-not-allowed font-semibold text-slate-900"
                                            />
                                            {durationSeconds !== null && (
                                                <p className="text-xs text-blue-700 font-semibold mt-1">
                                                    Est. Duration: {formatDuration(durationSeconds)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

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

                    {/* Interactive Routing Map */}
                    <div className="lg:col-span-5 lg:sticky lg:top-6">
                        <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <CardHeader className="bg-slate-900 py-4">
                                <CardTitle className="text-white text-md font-bold flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-amber-400" />
                                    Interactive Routing Map
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <MapComponent 
                                    locations={mapLocations} 
                                    onRouteCalculated={handleRouteCalculated} 
                                    onDestinationSelected={(lat, lng, address) => {
                                        setDestCoords({ lat, lng });
                                        setDestAddress(address);
                                    }}
                                />
                                <div className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                                    <span className="font-semibold text-slate-700 block mb-1">Route Path Information:</span>
                                    The map shows your starting point, waypoints, and destination in sequence. 
                                    OSRM calculates real-time road distance and travel times. Adding stops dynamically re-routes the trip.
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
