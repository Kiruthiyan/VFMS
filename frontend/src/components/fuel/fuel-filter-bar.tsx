"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { thirtyDaysAgoStr, todayStr } from "@/lib/fuel-utils";

interface Vehicle { id: string; label: string; }
interface Driver  { id: string; label: string; }

interface FuelFilterBarProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  onFilter: (params: {
    from: string;
    to: string;
    vehicleId?: string;
    driverId?: string;
  }) => void;
  loading?: boolean;
}

const selectClass =
  "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 " +
  "text-sm text-slate-900 focus:outline-none focus:ring-2 " +
  "focus:ring-amber-400 appearance-none cursor-pointer transition-all duration-200 " +
  "placeholder:text-slate-400 shadow-sm hover:border-slate-300";

export function FuelFilterBar({
  vehicles,
  drivers,
  onFilter,
  loading,
}: FuelFilterBarProps) {
  const [from, setFrom] = useState(thirtyDaysAgoStr());
  const [to, setTo] = useState(todayStr());
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");

  const handleFilter = () => {
    onFilter({
      from,
      to,
      vehicleId: vehicleId || undefined,
      driverId: driverId || undefined,
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(150px,0.75fr)_minmax(150px,0.75fr)_minmax(220px,1.15fr)_minmax(220px,1.15fr)_auto] xl:items-end">
      <div className="min-w-0 space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={selectClass}
        />
      </div>

      <div className="min-w-0 space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={selectClass}
        />
      </div>

      <div className="min-w-0 space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Vehicle</label>
        <Select
          value={vehicleId || "ALL"}
          onValueChange={(value) => setVehicleId(value === "ALL" ? "" : value)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All vehicles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-0 space-y-1">
        <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Driver</label>
        <Select
          value={driverId || "ALL"}
          onValueChange={(value) => setDriverId(value === "ALL" ? "" : value)}
        >
          <SelectTrigger className="h-11">
            <SelectValue placeholder="All drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={handleFilter}
        disabled={loading}
        className="h-11 w-full px-6 md:col-span-2 xl:col-span-1 xl:w-auto xl:min-w-32"
      >
        <SlidersHorizontal size={13} />
        {loading ? "Filtering..." : "Apply"}
      </Button>
    </div>
  );
}
