"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Vehicle, vehicleApi } from "@/lib/api/vehicle";
import { VehicleStatusBadge } from "@/components/vehicles/VehicleStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Car, Calendar, Fuel, Building, Hash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRole } from "@/lib/role-context";

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { canAdmin } = useRole();
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [loading, setLoading] = useState(true);
    const [retiring, setRetiring] = useState(false);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const res = await vehicleApi.getById(Number(id));
                setVehicle(res.data);
            } catch {
                toast.error("Failed to load vehicle");
            } finally {
                setLoading(false);
            }
        };
        fetchVehicle();
    }, [id]);

    const handleRetire = async () => {
        if (!confirm(`Are you sure you want to retire ${vehicle?.brand} ${vehicle?.model}? This cannot be undone.`)) return;
        setRetiring(true);
        try {
            await vehicleApi.retire(Number(id));
            toast.success("Vehicle retired from fleet");
            router.push("/dashboard/vehicles");
        } catch {
            toast.error("Failed to retire vehicle");
        } finally {
            setRetiring(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">Vehicle not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="p-8 max-w-3xl mx-auto animate-in fade-in duration-500">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Vehicles
                </Button>

                <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <CardHeader className="bg-blue-950 py-5 rounded-t-xl">
                        <CardTitle className="flex items-center gap-3 text-white text-lg">
                            <div className="h-9 w-9 bg-amber-400 rounded-lg flex items-center justify-center text-blue-950">
                                <Car className="h-5 w-5" />
                            </div>
                            {vehicle.brand} {vehicle.model}
                            <div className="ml-auto">
                                <VehicleStatusBadge status={vehicle.status} />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                                <Hash className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Plate Number</p>
                                    <p className="font-semibold text-slate-900">{vehicle.plateNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                                <Car className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Vehicle Type</p>
                                    <p className="font-semibold text-slate-900">{vehicle.vehicleType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                                <Fuel className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Fuel Type</p>
                                    <p className="font-semibold text-slate-900">{vehicle.fuelType}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Year</p>
                                    <p className="font-semibold text-slate-900">{vehicle.year}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg col-span-2">
                                <Building className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="text-xs text-slate-500">Department</p>
                                    <p className="font-semibold text-slate-900">{vehicle.department || "Not assigned"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6 mt-6 border-t border-slate-200 flex-wrap">
                            {canAdmin && (
                                <Button
                                    className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200"
                                    onClick={() => router.push(`/dashboard/vehicles/${vehicle.id}/edit`)}
                                >
                                    Edit Vehicle
                                </Button>
                            )}
                            {canAdmin && vehicle.status !== "RETIRED" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={handleRetire}
                                    disabled={retiring}
                                >
                                    {retiring ? "Retiring..." : "Retire Vehicle"}
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => router.back()}>
                                Back
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
