"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Assuming this exists, if not I'll use Input or standard textarea
import { Calendar as CalendarIcon, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

const tripSchema = z.object({
    tripType: z.enum(["BUSINESS", "DELIVERY", "CLIENT_VISIT", "OTHER"]),
    startLocation: z.string().min(2, "Start location is required"),
    destination: z.string().min(2, "Destination is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    passengerCount: z.string().transform(v => parseInt(v, 10)).or(z.number()),
    description: z.string().optional(),
});

type TripValues = z.infer<typeof tripSchema>;

export default function NewTripPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<TripValues>({
        resolver: zodResolver(tripSchema),
        defaultValues: {
            tripType: "BUSINESS",
            passengerCount: 1
        }
    });

    const onSubmit = async (data: TripValues) => {
        setIsLoading(true);
        try {
            // Mock API call for now, replace with actual endpoint
            // await api.post("/trips", data);

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Trip Requested",
                description: "Your booking request has been submitted for approval.",
                className: "bg-green-600 text-white border-none"
            });
            router.push("/dashboard/trips");
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to submit request",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/trips">
                    <Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-slate-100">
                        <ArrowLeft className="h-6 w-6 text-slate-500" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">New Booking Request</h1>
                    <p className="text-slate-500 mt-1">Schedule a new trip for business or client visit.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-md bg-white">
                <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl text-slate-800">Trip Details</CardTitle>
                    <CardDescription>Fill in the required information below.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        {/* Type & Passengers */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Trip Type</label>
                                <Select onValueChange={(val) => setValue("tripType", val as any)} defaultValue="BUSINESS">
                                    <SelectTrigger className="bg-white text-slate-900 border-slate-200 h-11">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200">
                                        <SelectItem value="BUSINESS">Business Meeting</SelectItem>
                                        <SelectItem value="CLIENT_VISIT">Client Visit</SelectItem>
                                        <SelectItem value="DELIVERY">Delivery / Logistics</SelectItem>
                                        <SelectItem value="OTHER">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.tripType && <p className="text-xs text-red-500 font-medium">{errors.tripType.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Passenger Count</label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    {...register("passengerCount")}
                                    className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                                />
                                {errors.passengerCount && <p className="text-xs text-red-500 font-medium">{errors.passengerCount.message}</p>}
                            </div>
                        </div>

                        {/* Locations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Start Location</label>
                                <Input
                                    placeholder="e.g. HQ Office"
                                    {...register("startLocation")}
                                    className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                                />
                                {errors.startLocation && <p className="text-xs text-red-500 font-medium">{errors.startLocation.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Destination</label>
                                <Input
                                    placeholder="e.g. Client Office, 123 Main St"
                                    {...register("destination")}
                                    className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                                />
                                {errors.destination && <p className="text-xs text-red-500 font-medium">{errors.destination.message}</p>}
                            </div>
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Start Time</label>
                                <Input
                                    type="datetime-local"
                                    {...register("startTime")}
                                    className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                                />
                                {errors.startTime && <p className="text-xs text-red-500 font-medium">{errors.startTime.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Expected End Time</label>
                                <Input
                                    type="datetime-local"
                                    {...register("endTime")}
                                    className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                                />
                                {errors.endTime && <p className="text-xs text-red-500 font-medium">{errors.endTime.message}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Purpose / Notes</label>
                            <Input
                                placeholder="Describe the purpose of the trip..."
                                {...register("description")}
                                className="bg-white text-slate-900 border-slate-200 focus:border-slate-400 h-11"
                            />
                        </div>

                        <div className="pt-4 flex justify-end gap-3">
                            <Link href="/dashboard/trips">
                                <Button type="button" variant="outline" className="h-11 px-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="h-11 px-8 rounded-xl bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 font-bold"
                            >
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Submit Booking
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
