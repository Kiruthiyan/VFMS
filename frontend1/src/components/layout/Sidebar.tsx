"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Truck,
    Users,
    Calendar,
    Settings,
    BarChart3,
    FileText,
    LogOut,
    ChevronRight,
    Download,
    Shield,
    UserCheck,
    Key,
    User
} from "lucide-react";

const roleMenuItems = [
    { icon: Shield, label: "Admin Portal", href: "/dashboard/admin" },
    { icon: UserCheck, label: "Approver Portal", href: "/dashboard/approver" },
    { icon: Key, label: "Driver Portal", href: "/dashboard/driver" },
    { icon: User, label: "User Portal", href: "/dashboard/user" },
];

const reportMenuItems = [
    { icon: LayoutDashboard, label: "Reports Overview", href: "/dashboard/reports" },
    { icon: FileText, label: "Maintenance Trends", href: "/dashboard/reports/maintenance" },
    { icon: BarChart3, label: "Fuel Analysis", href: "/dashboard/reports/fuel" },
    { icon: Truck, label: "Vehicle Utilization", href: "/dashboard/reports/utilization" },
    { icon: Users, label: "Driver Analytics", href: "/dashboard/reports/drivers" },
    { icon: Calendar, label: "Rental Insights", href: "/dashboard/reports/rentals" },
    { icon: Download, label: "Export Reports", href: "/dashboard/reports/export" },
];


export function Sidebar() {
    const pathname = usePathname();

    const NavGroup = ({ title, items }: { title: string, items: any[] }) => (
        <div className="mb-6">
            <h4 className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{title}</h4>
            <div className="space-y-1">
                {items.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard/reports" && pathname?.startsWith(item.href + "/"));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200",
                                isActive
                                    ? "bg-amber-500 text-slate-900 font-semibold shadow-md"
                                    : "hover:bg-slate-800/70 hover:text-white text-slate-400"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-amber-400")} />
                            <span className="flex-1 text-sm">{item.label}</span>
                            {isActive && <ChevronRight className="w-4 h-4 text-slate-900" />}
                        </Link>
                    );
                })}
            </div>
        </div>
    );

    return (
        <aside className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 border-r border-slate-800/50 shrink-0">
            <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <BarChart3 className="w-5 h-5 text-slate-900 font-bold" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">
                        Analytics<span className="text-amber-500">Pro</span>
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
                <NavGroup title="Role Dashboards" items={roleMenuItems} />
                <NavGroup title="Reporting & Analytics" items={reportMenuItems} />
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800/70 hover:text-white transition-all text-slate-400 group">
                    <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
