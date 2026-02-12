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
import { CalendarIcon, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ModuleLayout from "@/components/layout/ModuleLayout";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/use-toast";

interface Vehicle {
    id: number;
    make: string;
    model: string;
    licensePlate: string;
}

export default function FuelEntryPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { toast } = useToast();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [date, setDate] = useState<Date>();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form States
    const [selectedVehicle, setSelectedVehicle] = useState<string>("");
    const [liters, setLiters] = useState("");
    const [cost, setCost] = useState("");
    const [mileage, setMileage] = useState("");

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await api.get("/vehicles");
                setVehicles(response.data);
            } catch (error) {
                console.error("Failed to fetch vehicles:", error);
                toast({
                    variant: "destructive",
                    title: "Error fetching vehicles",
                    description: "Please try again later."
                });
            }
        };
        fetchVehicles();
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date || !selectedVehicle || !user) {
            toast({
                variant: "destructive",
                title: "Missing fields",
                description: "Please fill in all required fields."
            });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                vehicle: { id: parseInt(selectedVehicle) },
                driver: { id: user.id }, // Assuming user.id is the correct type (check backend if it needs int or uuid)
                quantity: parseFloat(liters),
                cost: parseFloat(cost),
                mileage: parseFloat(mileage),
                date: format(date, "yyyy-MM-dd")
            };

            await api.post("/fuel", payload);

            setSuccess(true);
            toast({
                title: "Success",
                description: "Fuel record saved successfully."
            });

            // Reset form
            setLiters("");
            setCost("");
            setMileage("");
            setDate(undefined);
            setSelectedVehicle("");

            // Redirect after short delay
            setTimeout(() => {
                router.push("/fuel");
            }, 1000);

        } catch (error) {
            console.error("Error saving fuel record:", error);
            toast({
                variant: "destructive",
                title: "Failed to save",
                description: "Could not save the fuel record. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModuleLayout title="Record Fuel Purchase">
            <div className="max-w-2xl mx-auto">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>New Fuel Entry</CardTitle>
                        <CardDescription>Record a new fuel purchase receipt details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="vehicle">Select Vehicle</Label>
                                <Select value={selectedVehicle} onValueChange={setSelectedVehicle} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select vehicle..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {vehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.id.toString()}>
                                                {v.make} {v.model} ({v.licensePlate})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="liters">Fuel Quantity (Liters)</Label>
                                    <Input
                                        id="liters"
                                        type="number"
                                        step="0.1"
                                        placeholder="0.00"
                                        value={liters}
                                        onChange={(e) => setLiters(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cost">Total Cost ($)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={cost}
                                        onChange={(e) => setCost(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mileage">Current Odometer (km)</Label>
                                <Input
                                    id="mileage"
                                    type="number"
                                    step="0.1"
                                    placeholder="e.g. 50120.5"
                                    value={mileage}
                                    onChange={(e) => setMileage(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Date of Purchase</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
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

                            <div className="space-y-2">
                                <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer">
                                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                    <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-400">PDF, PNG, JPG up to 5MB</p>
                                </div>
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : success ? (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Saved Successfully
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
