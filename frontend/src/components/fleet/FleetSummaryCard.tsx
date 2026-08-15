"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneClasses = {
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  slate: "bg-slate-100 text-slate-600 ring-slate-200",
};

type FleetSummaryTone = keyof typeof toneClasses;

export function FleetSummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "amber",
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: LucideIcon;
  tone?: FleetSummaryTone;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-500">{helper}</p>
        </div>
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1",
            toneClasses[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </div>
  );
}
