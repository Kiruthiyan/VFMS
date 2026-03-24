"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  "rounded-xl border border-slate-200 bg-white px-4 py-3 " +
  "text-sm text-slate-900 focus:outline-none focus:ring-2 " +
  "focus:ring-blue-950/40 appearance-none cursor-pointer transition-all duration-200 " +
  "placeholder:text-slate-400 shadow-sm hover:shadow-md";

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
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="block text-xs text-slate-700 font-medium">From</label>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className={selectClass}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-slate-700 font-medium">To</label>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className={selectClass}
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-slate-700 font-medium">Vehicle</label>
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className={selectClass}
        >
          <option value="">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-slate-700 font-medium">Driver</label>
        <select
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          className={selectClass}
        >
          <option value="">All drivers</option>
          {drivers.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <Button
        onClick={handleFilter}
        disabled={loading}
        className="h-9 px-4 rounded-xl bg-amber-500 text-slate-900
                   hover:bg-amber-400 font-semibold text-sm flex items-center
                   gap-2 disabled:opacity-60 transition-colors"
      >
        <SlidersHorizontal size={13} />
        {loading ? "Filtering..." : "Apply"}
      </Button>
    </div>
  );
}
