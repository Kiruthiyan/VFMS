import { LucideIcon } from "lucide-react";
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
    <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(148,163,184,0.14),_transparent_45%)]" />
      <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex gap-4">
          {Icon && (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-amber-200 bg-amber-50 text-amber-700 shadow-sm">
              <Icon size={24} className={iconClassName} />
            </span>
          )}
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">
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
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
