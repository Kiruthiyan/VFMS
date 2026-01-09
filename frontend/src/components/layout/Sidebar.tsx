"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Car,
    Users,
    Calendar,
    Wrench,
    Fuel,
    FileBarChart,
    Settings,
    ShieldAlert,
    LogOut,
    PlusCircle,
    CheckSquare,
    UserCircle
} from "lucide-react";
import { useEffect, useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        setRole(authService.getRole());
    }, []);

    const handleLogout = () => {
        authService.clearAuth();
        router.push("/auth/login");
    };

    const getItems = () => {
        switch (role) {
            case "ADMIN":
                return [
                    { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
                    { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
                    { name: "Drivers", href: "/dashboard/drivers", icon: Users },
                    { name: "Trips", href: "/dashboard/trips", icon: Calendar },
                    { name: "Maintenance", href: "/dashboard/vehicles/maintenance", icon: Wrench },
                    { name: "Fuel Logs", href: "/dashboard/fuel", icon: Fuel },
                    { name: "Reports", href: "/dashboard/reports", icon: FileBarChart },
                    { name: "Users", href: "/dashboard/users", icon: ShieldAlert },
                    { name: "Settings", href: "/dashboard/settings", icon: Settings },
                ];
            case "DRIVER":
                return [
                    { name: "Dashboard", href: "/dashboard/driver", icon: LayoutDashboard },
                    { name: "My Trips", href: "/dashboard/trips", icon: Calendar },
                    { name: "My Profile", href: "/dashboard/profile", icon: UserCircle },
                ];
            case "SYSTEM_USER":
            case "STAFF":
                return [
                    { name: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
                    { name: "Book Trip", href: "/dashboard/trips/new", icon: PlusCircle },
                    { name: "My Requests", href: "/dashboard/trips", icon: Calendar },
                ];
            case "APPROVER":
                return [
                    { name: "Dashboard", href: "/dashboard/approver", icon: LayoutDashboard },
                    { name: "Approvals", href: "/dashboard/approvals", icon: CheckSquare },
                ];
            default:
                return [];
        }
    };

    const sidebarItems = getItems();

    if (!role) return null; // Hydration handling

    return (
        <div className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-50">
            <div className="flex h-20 items-center px-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="font-black text-slate-900 text-sm">F</span>
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight text-white leading-none">FLEETPRO<span className="text-amber-400">.</span></h1>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{role} Portal</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
                <nav className="grid gap-1 px-4">
                    <p className="px-4 text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 mb-2">Main Menu</p>
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 border border-transparent",
                                    isActive
                                        ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20 translate-x-1"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 hover:translate-x-1"
                                )}>
                                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-slate-900" : "text-slate-500 group-hover:text-amber-400")} />
                                {item.name}
                                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900" />}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/30">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent h-12 rounded-xl"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
