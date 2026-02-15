"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Car, MoreHorizontal, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { vehicleService, Vehicle } from "@/services/vehicleService";

const vehicleSchema = z.object({
  licensePlate: z.string().min(2, "License plate is required"),
  model: z.string().min(2, "Model is required"),
  category: z.enum(["SEDAN", "SUV", "VAN", "TRUCK", "BUS"]),
  fuelType: z.enum(["PETROL", "DIESEL", "ELECTRIC", "HYBRID"]),
  status: z.enum(["AVAILABLE", "MAINTENANCE", "RENTED", "ON_TRIP", "INACTIVE"]).default("AVAILABLE"),
});

type VehicleValues = z.infer<typeof vehicleSchema>;

export default function VehiclesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      status: "AVAILABLE",
    },
  });

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedVehicleHistory, setSelectedVehicleHistory] = useState<Vehicle | null>(null);

  // Mock History Data (Keep mock for history as it's a separate entity not yet implemented)
  const mockHistory = [
    { id: 1, date: "2024-03-10", type: "Maintenance", description: "Oil Change", cost: "$50" },
    { id: 2, date: "2024-03-05", type: "Trip", description: "Completed Trip to Downtown", cost: "-" },
    { id: 3, date: "2024-02-28", type: "Service", description: "Tire Rotation", cost: "$80" },
  ];

  const fetchVehicles = async () => {
    setIsFetching(true);
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load vehicles", variant: "destructive" });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const onEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setValue("licensePlate", vehicle.licensePlate);
    setValue("model", vehicle.model);
    setValue("category", vehicle.category as any);
    setValue("fuelType", vehicle.fuelType as any);
    setValue("status", vehicle.status as any);
    setIsAddOpen(true);
  };

  const onHistoryClick = (vehicle: Vehicle) => {
    setSelectedVehicleHistory(vehicle);
    setIsHistoryOpen(true);
  };

  const handleDeactivate = async (id: number) => {
    // Optimistic update
    const previousVehicles = [...vehicles];
    setVehicles(vehicles.map(v => v.id === id ? { ...v, status: "INACTIVE" } : v));

    try {
      // Since the backend API for partial update might not be fully fleshed out for just status, 
      // we will try to get the vehicle and update its status.
      const vehicle = vehicles.find(v => v.id === id);
      if (vehicle) {
        await vehicleService.update(id, { ...vehicle, status: "INACTIVE" });
        toast({ title: "Vehicle Deactivated", description: "Status updated to Inactive." });
        fetchVehicles(); // Refresh to be sure
      }
    } catch (err) {
      setVehicles(previousVehicles);
      toast({ title: "Error", description: "Failed to deactivate vehicle", variant: "destructive" });
    }
  };

  const onDeleteClick = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await vehicleService.delete(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({ title: "Vehicle Deleted", description: "Vehicle removed successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete vehicle", variant: "destructive" });
    }
  }


  const onAddSubmit = async (data: VehicleValues) => {
    setIsLoading(true);
    try {
      if (editingVehicle) {
        // Update existing
        await vehicleService.update(editingVehicle.id, {
          ...editingVehicle,
          ...data
        });
        toast({ title: "Vehicle Updated", description: `${data.model} updated successfully.` });
      } else {
        // Add new
        await vehicleService.create({
          ...data,
          make: "Unknown", // Default or extract from model
          year: new Date().getFullYear(),
          fuelLevel: "100%",
          currentOdometer: 0,
          lastServiceDate: new Date().toISOString().split('T')[0]
        });
        toast({ title: "Vehicle Registered", description: `${data.model} added successfully.` });
      }
      setIsAddOpen(false);
      setEditingVehicle(null);
      reset();
      fetchVehicles();
    } catch (err) {
      toast({ title: "Error", description: "Failed to save vehicle", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Vehicle Management</h1>
          <p className="text-slate-500 mt-1">Register and track fleet assets</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchVehicles} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog
            open={isAddOpen}
            onOpenChange={(open) => {
              setIsAddOpen(open);
              if (!open) {
                reset();
                setEditingVehicle(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200" onClick={() => { setEditingVehicle(null); reset(); }}>
                <Plus className="mr-2 h-4 w-4" /> Add Vehicle
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] bg-white text-slate-900">
              <DialogHeader>
                <DialogTitle>{editingVehicle ? "Edit Vehicle Details" : "Register New Vehicle"}</DialogTitle>
                <DialogDescription>
                  {editingVehicle ? "Update vehicle information." : "Enter vehicle details to add to the fleet."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">License Plate</label>
                    <Input className="bg-white text-slate-900" placeholder="ABC-1234" {...register("licensePlate")} />
                    {errors.licensePlate && <p className="text-xs text-red-500">{errors.licensePlate.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Model / Make</label>
                    <Input className="bg-white text-slate-900" placeholder="Toyota Camry" {...register("model")} />
                    {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select onValueChange={(val) => setValue("category", val as any, { shouldValidate: true })} defaultValue={editingVehicle?.category}>
                      <SelectTrigger className="bg-white text-slate-900"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="SEDAN">Sedan</SelectItem>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="VAN">Van</SelectItem>
                        <SelectItem value="TRUCK">Truck</SelectItem>
                        <SelectItem value="BUS">Bus</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Fuel Type</label>
                    <Select onValueChange={(val) => setValue("fuelType", val as any, { shouldValidate: true })} defaultValue={editingVehicle?.fuelType}>
                      <SelectTrigger className="bg-white text-slate-900"><SelectValue placeholder="Select Fuel" /></SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="PETROL">Petrol</SelectItem>
                        <SelectItem value="DIESEL">Diesel</SelectItem>
                        <SelectItem value="ELECTRIC">Electric</SelectItem>
                        <SelectItem value="HYBRID">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.fuelType && <p className="text-xs text-red-500">{errors.fuelType.message}</p>}
                  </div>
                </div>

                {/* Status Field (Visible only in Edit) */}
                {editingVehicle && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select onValueChange={(val) => setValue("status", val as any)} defaultValue={editingVehicle?.status}>
                      <SelectTrigger className="bg-white text-slate-900"><SelectValue placeholder="Select Status" /></SelectTrigger>
                      <SelectContent className="bg-white text-slate-900">
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="ON_TRIP">On Trip</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={isLoading} className="bg-blue-950 hover:bg-blue-900 text-white shadow-lg shadow-blue-200">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {editingVehicle ? "Update Vehicle" : "Register Vehicle"}
                  </Button>
                </DialogFooter>

              </form>
            </DialogContent>
          </Dialog>
        </div>


        {/* --- HISTORY DIALOG --- */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="sm:max-w-[600px] bg-white text-slate-900">
            <DialogHeader>
              <DialogTitle>Vehicle History</DialogTitle>
              <DialogDescription>
                Recent activity for <span className="font-bold text-slate-900">{selectedVehicleHistory?.model} ({selectedVehicleHistory?.licensePlate})</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Date</th>
                      <th className="px-4 py-3 font-semibold">Type</th>
                      <th className="px-4 py-3 font-semibold">Description</th>
                      <th className="px-4 py-3 font-semibold text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-600">{item.date}</td>
                        <td className="px-4 py-3 font-medium">{item.type}</td>
                        <td className="px-4 py-3 text-slate-600">{item.description}</td>
                        <td className="px-4 py-3 text-right text-slate-900 font-bold">{item.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsHistoryOpen(false)} variant="outline">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {isFetching && vehicles.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Loading vehicles...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-700">Vehicle Info</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Fuel</th>
                <th className="px-6 py-4 font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Car className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{vehicle.model}</div>
                        <div className="text-slate-500 text-xs">{vehicle.licensePlate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium text-xs">{vehicle.category}</span></td>
                  <td className="px-6 py-4 text-slate-600">{vehicle.fuelType}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${vehicle.status === "AVAILABLE" ? "bg-green-100 text-green-700" : vehicle.status === "MAINTENANCE" ? "bg-red-100 text-red-700" : vehicle.status === "ON_TRIP" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${vehicle.status === "AVAILABLE" ? "bg-green-600" : vehicle.status === "MAINTENANCE" ? "bg-red-600" : vehicle.status === "ON_TRIP" ? "bg-blue-600" : "bg-gray-600"}`} />
                      {vehicle.status?.replace("_", " ") || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white text-slate-900">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditClick(vehicle)}>Edit Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onHistoryClick(vehicle)}>View History</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:bg-red-50" onClick={() => onDeleteClick(vehicle.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
