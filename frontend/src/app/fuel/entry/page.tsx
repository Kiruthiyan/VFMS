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
import { CalendarIcon, Upload, Loader2, CheckCircle, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleLayout from "@/components/layout/ModuleLayout";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
}

// Pre-populated fuel stations based on sample data
const FUEL_STATIONS = [
    "Shell Station",
    "BP Fuel",
    "Total Gas",
    "Chevron",
    "Exxon",
    "Mobil",
    "Gulf Oil",
    "Texaco",
    "Shell Diesel",
    "Total Diesel",
    "Chevron Diesel",
    "Other"
];

export default function FuelEntryPage() {
    const router = useRouter();
    const { user } = useAuthStore();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [date, setDate] = useState<Date>();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    // Form States
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [liters, setLiters] = useState("");
    const [cost, setCost] = useState("");
    const [mileage, setMileage] = useState("");
    const [stationName, setStationName] = useState("");
    const [receipt, setReceipt] = useState<File | null>(null);
    const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

    // Validation errors
    const [errors, setErrors] = useState({
        liters: "",
        cost: "",
        mileage: ""
    });

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

    const validateNumber = (value: string, field: string): boolean => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            setErrors(prev => ({ ...prev, [field]: "Must be a positive number" }));
            return false;
        }
        setErrors(prev => ({ ...prev, [field]: "" }));
        return true;
    };

    const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLiters(value);
        if (value) validateNumber(value, 'liters');
    };

    const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCost(value);
        if (value) validateNumber(value, 'cost');
    };

    const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMileage(value);
        if (value) validateNumber(value, 'mileage');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File too large. Please upload a file smaller than 5MB.");
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                toast.error("Invalid file type. Please upload a JPG, PNG, or PDF file.");
                return;
            }

            setReceipt(file);

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setReceiptPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            } else {
                setReceiptPreview(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all required fields
        if (!date) {
            toast.error("Please select a date");
            return;
        }

        if (!selectedVehicle) {
            toast.error("Please select a vehicle");
            return;
        }

        if (!liters || !cost || !mileage) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Validate numbers
        const isLitersValid = validateNumber(liters, 'liters');
        const isCostValid = validateNumber(cost, 'cost');
        const isMileageValid = validateNumber(mileage, 'mileage');

        if (!isLitersValid || !isCostValid || !isMileageValid) {
            toast.error("Please enter valid positive numbers");
            return;
        }

        setLoading(true);
        try {
            // First, upload receipt if provided
            let receiptPath = "";
            if (receipt) {
                const formData = new FormData();
                formData.append("file", receipt);

                const uploadRes = await api.post("/fuel/upload-receipt", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                receiptPath = uploadRes.data.receiptPath || uploadRes.data.path || "";
            }

            const payload = {
                vehicleId: parseInt(selectedVehicle),
                driverId: user?.id || null,
                quantity: parseFloat(liters),
                cost: parseFloat(cost),
                pricePerLiter: parseFloat(cost) / parseFloat(liters),
                mileage: parseFloat(mileage),
                stationName: stationName || undefined,
                receiptPath: receiptPath || undefined,
                date: format(date, "yyyy-MM-dd")
            };

            await api.post("/fuel", payload);

            setSuccess(true);
            toast.success("Fuel record saved successfully!");

            // Reset form
            setLiters("");
            setCost("");
            setMileage("");
            setStationName("");
            setReceipt(null);
            setReceiptPreview(null);
            setDate(undefined);
            setSelectedVehicle("");

            // Redirect after short delay
            setTimeout(() => {
                router.push("/fuel");
            }, 1500);

        } catch (error: any) {
            console.error("Error saving fuel record:", error);
            const errorMsg = error.response?.data?.message || "Could not save the fuel record. Please try again.";
            toast.error(errorMsg);
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
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Vehicle Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="vehicle" className="text-sm font-semibold text-slate-700">
                                    Select Vehicle <span className="text-red-500">*</span>
                                </Label>
                                {loadingVehicles ? (
                                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        <span className="text-sm text-slate-500">Loading vehicles...</span>
                                    </div>
                                ) : vehicles.length === 0 ? (
                                    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50 text-amber-700">
                                        <p className="text-sm font-medium">No vehicles available</p>
                                        <p className="text-xs mt-1">Please contact admin to add vehicles</p>
                                    </div>
                                ) : (
                                    <Select value={selectedVehicle} onValueChange={setSelectedVehicle} required>
                                        <SelectTrigger className="h-12 border-slate-300 bg-white">
                                            <SelectValue placeholder="Choose a vehicle..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {vehicles.map((v) => (
                                                <SelectItem key={v.id} value={v.id.toString()} className="bg-white hover:bg-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold">{v.make} {v.model}</span>
                                                        <span className="text-slate-500">({v.licensePlate})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Quantity and Cost */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
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
                                        onChange={handleLitersChange}
                                        className={cn("h-12", errors.liters && "border-red-500")}
                                        required
                                    />
                                    {errors.liters && <p className="text-xs text-red-500 font-medium">{errors.liters}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost" className="text-sm font-semibold text-slate-700">
                                        Total Cost ($) <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        placeholder="145.60"
                                        value={cost}
                                        onChange={handleCostChange}
                                        className={cn("h-12", errors.cost && "border-red-500")}
                                        required
                                    />
                                    {errors.cost && <p className="text-xs text-red-500 font-medium">{errors.cost}</p>}
                                </div>
                            </div>

                            {/* Mileage */}
                            <div className="space-y-2">
                                <Label htmlFor="mileage" className="text-sm font-semibold text-slate-700">
                                    Current Odometer (km) <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="mileage"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    placeholder="e.g., 50120.5"
                                    value={mileage}
                                    onChange={handleMileageChange}
                                    className={cn("h-12", errors.mileage && "border-red-500")}
                                    required
                                />
                                {errors.mileage && <p className="text-xs text-red-500 font-medium">{errors.mileage}</p>}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700">
                                    Date of Purchase <span className="text-red-500">*</span>
                                </Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full h-12 justify-start text-left font-normal border-slate-300",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Fuel Station Dropdown */}
                            <div className="space-y-2">
                                <Label htmlFor="station" className="text-sm font-semibold text-slate-700">
                                    Fuel Station (Optional)
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
                            <div className="space-y-2">
                                <Label htmlFor="receipt" className="text-sm font-semibold text-slate-700">
                                    Upload Receipt (Optional)
                                </Label>
                                <input
                                    id="receipt"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
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

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
                                disabled={loading || loadingVehicles}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="mr-2 h-5 w-5" />
                                        Saved Successfully!
                                    </>
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
