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
    <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex gap-4">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Icon size={22} className={iconClassName} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
