"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload, Loader2, CheckCircle, Fuel, Car, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleLayout from "@/components/layout/ModuleLayout";
import api from "@/lib/api";
import { toast } from "sonner";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
    fuelType: string;
    status: string;
}

const FUEL_STATIONS = [
    "Shell Station", "BP Fuel", "Total Gas", "Chevron", "Exxon",
    "Mobil", "Gulf Oil", "Texaco", "Shell Diesel", "Total Diesel",
    "Chevron Diesel", "Other"
];

type FormErrors = {
    vehiclePlate: string;
    date: string;
    liters: string;
    cost: string;
    mileage: string;
};

const NO_ERRORS: FormErrors = { vehiclePlate: "", date: "", liters: "", cost: "", mileage: "" };

function FieldError({ message }: { message: string }) {
    if (!message) return null;
    return (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium mt-1">
            <AlertCircle className="h-3 w-3 flex-shrink-0" />
            {message}
        </p>
    );
}

export default function FuelEntryPage() {
    const router = useRouter();

    const [date, setDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);

    // Vehicles from system
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);

    // Form fields
    const [vehiclePlate, setVehiclePlate] = useState("");
    const [liters, setLiters] = useState("");
    const [cost, setCost] = useState("");
    const [mileage, setMileage] = useState("");
    const [stationName, setStationName] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    // Field-level errors (only shown after blur or submit attempt)
    const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoadingVehicles(true);
            try {
                const response = await api.get("/vehicles");
                setVehicles(response.data || []);
            } catch (error) {
                console.error("Failed to fetch vehicles:", error);
                toast.error("Failed to load vehicles. Please refresh the page.");
            } finally {
                setLoadingVehicles(false);
            }
        };
        fetchVehicles();
    }, []);

    // Validate a positive number field; returns error string or ""
    const validatePositive = (value: string, label: string): string => {
        if (!value.trim()) return `${label} is required`;
        const num = parseFloat(value);
        if (isNaN(num)) return `${label} must be a number`;
        if (num <= 0) return `${label} must be greater than 0`;
        return "";
    };

    const validateMileage = (value: string): string => {
        if (!value.trim()) return "Odometer reading is required";
        const num = parseFloat(value);
        if (isNaN(num)) return "Odometer must be a number";
        if (num < 0) return "Odometer cannot be negative";
        return "";
    };

    const validateAll = (): FormErrors => ({
        vehiclePlate: !vehiclePlate ? "Please select a vehicle" : "",
        date: !date ? "Date of purchase is required" : "",
        liters: validatePositive(liters, "Fuel quantity"),
        cost: validatePositive(cost, "Total cost"),
        mileage: validateMileage(mileage),
    });

    const handleVehicleSelect = (plate: string) => {
        setVehiclePlate(plate);
        if (submitted) setErrors(prev => ({ ...prev, vehiclePlate: "" }));
    };

    const handleDateSelect = (d: Date | undefined) => {
        setDate(d);
        setCalendarOpen(false);
        if (submitted) setErrors(prev => ({ ...prev, date: !d ? "Date of purchase is required" : "" }));
    };

    const handleBlur = (field: keyof FormErrors, value: string) => {
        if (!submitted) return; // only show errors after first submit attempt
        let err = "";
        if (field === "liters") err = validatePositive(value, "Fuel quantity");
        else if (field === "cost") err = validatePositive(value, "Total cost");
        else if (field === "mileage") err = validateMileage(value);
        setErrors(prev => ({ ...prev, [field]: err }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Maximum size is 5MB.");
            return;
        }
        const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
        if (!validTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload JPG, PNG, or PDF.");
            return;
        }
        setReceipt(file);
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setReceiptPreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setReceiptPreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);

        const validationErrors = validateAll();
        setErrors(validationErrors);

        const hasErrors = Object.values(validationErrors).some(v => v !== "");
        if (hasErrors) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        setLoading(true);
        try {
            let receiptPath = "";
            if (receipt) {
                const formData = new FormData();
                formData.append("file", receipt);
                const uploadRes = await api.post("/fuel/upload-receipt", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                receiptPath = uploadRes.data.receiptPath || uploadRes.data.path || "";
            }

            const litersNum = parseFloat(liters);
            const costNum = parseFloat(cost);

            const payload = {
                vehiclePlate,
                quantity: litersNum,
                cost: costNum,
                pricePerLiter: parseFloat((costNum / litersNum).toFixed(4)),
                mileage: parseFloat(mileage),
                stationName: stationName || null,
                receiptPath: receiptPath || null,
                date: format(date!, "yyyy-MM-dd"),
            };

            await api.post("/fuel", payload);
            setSuccess(true);
            toast.success("Fuel record saved successfully!");

            // Reset form
            setVehiclePlate("");
            setLiters("");
            setCost("");
            setMileage("");
            setStationName("");
            setReceipt(null);
            setReceiptPreview(null);
            setDate(undefined);
            setErrors(NO_ERRORS);
            setSubmitted(false);

            setTimeout(() => router.push("/fuel"), 1500);
        } catch (error: any) {
            const msg = error.response?.data?.message || "Could not save the fuel record. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModuleLayout title="Record Fuel Purchase">
            <div className="max-w-3xl mx-auto">
                <Card className="border-slate-200 shadow-lg">
                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                <Fuel className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-900">New Fuel Entry</CardTitle>
                                <CardDescription className="text-slate-600">Record a new fuel purchase with receipt details</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">

                            {/* Vehicle Selection */}
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Select Vehicle <span className="text-red-500">*</span>
                                </Label>
                                <Select value={vehiclePlate} onValueChange={handleVehicleSelect} disabled={vehiclesLoading}>
                                    <SelectTrigger className={cn("h-12 border-slate-300 bg-white", errors.vehiclePlate && "border-red-500 focus:ring-red-500")}>
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4 text-slate-400" />
                                            <SelectValue placeholder={vehiclesLoading ? "Loading vehicles..." : "Select a vehicle from fleet"} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-white max-h-64">
                                        {vehicles.length === 0 && !vehiclesLoading ? (
                                            <div className="px-3 py-4 text-sm text-slate-500 text-center">No active vehicles found</div>
                                        ) : vehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.licensePlate} className="bg-white hover:bg-slate-50">
                                                <span className="font-medium">{v.make} {v.model}</span>
                                                <span className="ml-2 text-slate-500 text-xs">({v.licensePlate})</span>
                                                <span className="ml-1 text-xs text-blue-500">{v.fuelType}</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError message={errors.vehiclePlate} />
                            </div>

                            {/* Date */}
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Date of Purchase <span className="text-red-500">*</span>
                                </Label>
                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal border-slate-300",
                                                !date && "text-muted-foreground",
                                                errors.date && "border-red-500"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={handleDateSelect}
                                            disabled={(d) => d > new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FieldError message={errors.date} />
                            </div>

                            {/* Quantity and Cost */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="liters" className="text-sm font-semibold text-slate-700">
                                        Fuel Quantity (Liters) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="liters"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="45.50"
                                        value={liters}
                                        onChange={e => setLiters(e.target.value)}
                                        onBlur={e => handleBlur("liters", e.target.value)}
                                        className={cn("h-12", errors.liters && "border-red-500")}
                                    />
                                    <FieldError message={errors.liters} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="cost" className="text-sm font-semibold text-slate-700">
                                        Total Cost (â‚¹) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="4550.00"
                                        value={cost}
                                        onChange={e => setCost(e.target.value)}
                                        onBlur={e => handleBlur("cost", e.target.value)}
                                        className={cn("h-12", errors.cost && "border-red-500")}
                                    />
                                    <FieldError message={errors.cost} />
                                </div>
                            </div>

                            {/* Price per liter computed display */}
                            {liters && cost && parseFloat(liters) > 0 && parseFloat(cost) > 0 && (
                                <p className="text-xs text-slate-500 -mt-2 px-1">
                                    Price per liter: <span className="font-semibold text-slate-700">â‚¹{(parseFloat(cost) / parseFloat(liters)).toFixed(2)}</span>
                                </p>
                            )}

                            {/* Mileage */}
                            <div className="space-y-1">
                                <Label htmlFor="mileage" className="text-sm font-semibold text-slate-700">
                                    Current Odometer Reading (km) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="mileage"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="e.g., 50120.5"
                                    value={mileage}
                                    onChange={e => setMileage(e.target.value)}
                                    onBlur={e => handleBlur("mileage", e.target.value)}
                                    className={cn("h-12", errors.mileage && "border-red-500")}
                                />
                                <FieldError message={errors.mileage} />
                            </div>

                            {/* Fuel Station */}
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Fuel Station <span className="text-slate-400 font-normal">(Optional)</span>
                                </Label>
                                <Select value={stationName} onValueChange={setStationName}>
                                    <SelectTrigger className="h-12 border-slate-300 bg-white">
                                        <SelectValue placeholder="Select fuel station..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white">
                                        {FUEL_STATIONS.map((station) => (
                                            <SelectItem key={station} value={station} className="bg-white hover:bg-slate-100">
                                                {station}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Receipt Upload */}
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Upload Receipt <span className="text-slate-400 font-normal">(Optional)</span>
                                </Label>
                                <input id="receipt" type="file" accept="image/*,application/pdf" onChange={handleFileChange} className="hidden" />
                                <label
                                    htmlFor="receipt"
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-blue-400 transition-all cursor-pointer block"
                                >
                                    <Upload className="h-10 w-10 text-slate-400 mb-3" />
                                    <p className="text-sm text-slate-700 font-semibold">
                                        {receipt ? receipt.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">PDF, PNG, JPG up to 5MB</p>
                                </label>
                                {receiptPreview && (
                                    <div className="mt-3 p-3 border rounded-lg bg-slate-50">
                                        <p className="text-xs font-semibold text-slate-600 mb-2">Preview:</p>
                                        <img src={receiptPreview} alt="Receipt preview" className="max-h-48 rounded-lg border mx-auto" />
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
                                disabled={loading || success}
                            >
                                {loading ? (
                                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Saving...</>
                                ) : success ? (
                                    <><CheckCircle className="mr-2 h-5 w-5" />Saved Successfully!</>
                                ) : (
                                    "Save Fuel Record"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ModuleLayout>
    );
}
