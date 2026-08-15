import { LucideIcon, Sparkles } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconClassName = "text-slate-950",
  actions,
}: PageHeaderProps) {
  return (
    <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-[28px]">
      <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.14),_transparent_45%)]" />
      <div className="relative flex min-w-0 flex-col gap-5 p-4 sm:p-7">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
          <Sparkles className="h-3.5 w-3.5" />
          FleetPro Workspace
        </div>
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 gap-4">
          {Icon && (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm sm:h-14 sm:w-14">
              <Icon size={24} className={iconClassName} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>
          {actions && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
