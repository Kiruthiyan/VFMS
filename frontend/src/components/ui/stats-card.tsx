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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 mb-2">{displayLabel}</p>
          <p className="text-3xl font-bold text-slate-100">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-2">{subtitle}</p>
          )}
          {trend && <p className="text-xs text-slate-500 mt-2">{trend}</p>}
        </div>
        <Icon size={24} className={`${iconColor} opacity-60`} />
      </div>
    </div>
  );
}
