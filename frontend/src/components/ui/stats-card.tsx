import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatsCard({
  label,
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconColor = "text-slate-400",
}: StatsCardProps) {
  const displayLabel = label || title;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 truncate text-sm font-medium text-slate-500">{displayLabel}</p>
          <p className="break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{value}</p>
          {subtitle && (
            <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
          )}
          {trend && <p className="mt-2 text-xs leading-5 text-slate-500">{trend}</p>}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <Icon size={22} className={`${iconColor} opacity-80`} />
        </span>
      </div>
    </div>
  );
}
