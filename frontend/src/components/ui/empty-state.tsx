import { LucideIcon, FileQuestion } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export function EmptyState({
    icon: Icon = FileQuestion,
    title,
    description,
    action
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border shadow-sm">
            <div className="rounded-full bg-slate-100 p-6 mb-4">
                <Icon className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
            )}
            {action}
        </div>
    );
}
