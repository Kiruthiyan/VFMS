"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Users,
    Fuel,
    FileBarChart,
    LogOut,
    PlusCircle,
    UserCircle,
    AlertCircle,
    BarChart3,
    ClipboardList,
    ChevronDown,
    ChevronRight,
    Gauge,
} from "lucide-react";
import { useEffect, useState } from "react";

interface NavItem {
    name: string;
    href: string;
    icon: React.FC<any>;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface NavModule {
    type: "group";
    label: string;
    groups: NavGroup[];
}

interface NavSection {
    type: "section";
    label: string;
    items: NavItem[];
}

type SidebarSection = NavModule | NavSection;

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);
    const [fuelOpen, setFuelOpen] = useState(false);

    useEffect(() => {
        setRole(authService.getRole());
    }, []);

    // Auto-open Fuel Management if currently on a fuel page
    useEffect(() => {
        if (pathname.startsWith("/fuel")) setFuelOpen(true);
    }, [pathname]);

    const handleLogout = () => {
        authService.clearAuth();
        router.push("/auth/login");
    };

    const isActive = (href: string) =>
        pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

    /* ──────────────────────────────── ADMIN CONFIG ─────────────────────────── */
    const adminSections: SidebarSection[] = [
        {
            type: "section",
            label: "Overview",
            items: [
                { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
            ],
        },
        {
            type: "section",
            label: "Management",
            items: [
                { name: "Users", href: "/admin/users", icon: Users },
            ],
        },
        {
            type: "group",
            label: "Fuel Management",
            groups: [
                {
                    label: "all",
                    items: [
                        { name: "Fuel Records", href: "/fuel", icon: ClipboardList },
                        { name: "Add Fuel Entry", href: "/fuel/entry", icon: PlusCircle },
                        { name: "Analytics", href: "/fuel/analytics", icon: BarChart3 },
                        { name: "Summary Report", href: "/fuel/summary", icon: FileBarChart },
                        { name: "Alerts", href: "/fuel/alerts", icon: AlertCircle },
                    ],
                },
            ],
        },
    ];

    /* ──────────────────────────────── STAFF CONFIG ─────────────────────────── */
    const staffItems: NavItem[] = [
        { name: "Dashboard", href: "/dashboard/staff", icon: LayoutDashboard },
        { name: "Fuel Records", href: "/fuel", icon: ClipboardList },
        { name: "Add Fuel Entry", href: "/fuel/entry", icon: PlusCircle },
        { name: "Fuel Summary", href: "/fuel/summary", icon: FileBarChart },
        { name: "Fuel Alerts", href: "/fuel/alerts", icon: AlertCircle },
    ];

    /* ──────────────────────────────── DRIVER CONFIG ─────────────────────────── */
    const driverItems: NavItem[] = [
        { name: "Dashboard", href: "/dashboard/driver", icon: LayoutDashboard },
        { name: "Add Fuel Entry", href: "/fuel/entry", icon: PlusCircle },
        { name: "Fuel Records", href: "/fuel", icon: ClipboardList },
        { name: "Profile", href: "/profile", icon: UserCircle },
    ];

    /* ──────────────────────────────── APPROVER CONFIG ─────────────────────────── */
    const approverItems: NavItem[] = [
        { name: "Dashboard", href: "/dashboard/approver", icon: LayoutDashboard },
        { name: "Fuel Analytics", href: "/fuel/analytics", icon: BarChart3 },
        { name: "Fuel Summary", href: "/fuel/summary", icon: FileBarChart },
        { name: "Fuel Alerts", href: "/fuel/alerts", icon: AlertCircle },
        { name: "Fuel Records", href: "/fuel", icon: ClipboardList },
    ];

    if (!role) return null;

    /* ───────────────── SIMPLE NAV ITEM ───────────── */
    const NavLink = ({ item }: { item: NavItem }) => {
        const active = isActive(item.href);
        return (
            <Link
                href={item.href}
                className={cn(
                    "group flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border border-transparent",
                    active
                        ? "bg-amber-400 text-slate-900 shadow-lg shadow-amber-400/20 translate-x-1"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white hover:border-slate-700 hover:translate-x-1"
                )}
            >
                <item.icon
                    className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-slate-900" : "text-slate-500 group-hover:text-amber-400"
                    )}
                />
                {item.name}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900/60" />}
            </Link>
        );
    };

    /* ───────────────── FUEL MODULE (COLLAPSIBLE) ───────────── */
    const isFuelActive = pathname.startsWith("/fuel");

    const FuelModule = ({ groups }: { groups: NavGroup[] }) => {
        // Flatten all items into one list (no sub-group labels)
        const allItems = groups.flatMap(g => g.items);
        return (
            <div>
                {/* Module header — click to navigate AND toggle */}
                <Link
                    href="/fuel/dashboard"
                    onClick={(e) => { e.preventDefault(); setFuelOpen(!fuelOpen); router.push("/fuel/dashboard"); }}
                    className={cn(
                        "w-full flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 border",
                        isFuelActive
                            ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white border-transparent hover:border-slate-700"
                    )}
                >
                    <Fuel
                        className={cn(
                            "h-4 w-4 shrink-0",
                            isFuelActive ? "text-amber-400" : "text-slate-500"
                        )}
                    />
                    <span className="flex-1 text-left">Fuel Management</span>
                    {isFuelActive && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md">
                            Active
                        </span>
                    )}
                    {fuelOpen ? (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    )}
                </Link>

                {/* Clean flat sub-item list */}
                {fuelOpen && (
                    <div className="mt-1 ml-3 pl-3 border-l border-slate-700/60 py-1.5 grid gap-0.5">
                        {allItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 border border-transparent",
                                        active
                                            ? "bg-amber-400 text-slate-900 shadow-sm shadow-amber-400/20"
                                            : "text-slate-400 hover:bg-slate-800/70 hover:text-white hover:border-slate-700/50"
                                    )}
                                >
                                    <item.icon
                                        className={cn(
                                            "h-3.5 w-3.5 shrink-0",
                                            active ? "text-slate-900" : "text-slate-600 group-hover:text-amber-400"
                                        )}
                                    />
                                    {item.name}
                                    {active && (
                                        <div className="ml-auto w-1 h-1 rounded-full bg-slate-900/60" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    /* ───────────────── RENDER ───────────── */
    return (
        <div className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-2xl z-50">
            {/* Logo */}
            <div className="flex h-20 items-center px-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/30">
                        <Gauge className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                        <h1 className="font-black text-lg tracking-tight text-white leading-none">
                            FLEETPRO<span className="text-amber-400">.</span>
                        </h1>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {role.replace("_", " ")} Portal
                        </span>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 overflow-y-auto py-5 space-y-1 custom-scrollbar">
                {role === "ADMIN" ? (
                    <div className="px-4 space-y-5">
                        {adminSections.map((section, i) => {
                            if (section.type === "group") {
                                return (
                                    <div key={i}>
                                        <p className="px-4 text-[9px] uppercase font-black tracking-[0.2em] text-slate-600 mb-2">
                                            {section.label}
                                        </p>
                                        <FuelModule groups={(section as NavModule).groups} />
                                    </div>
                                );
                            }
                            const sec = section as NavSection;
                            return (
                                <div key={i}>
                                    <p className="px-4 text-[9px] uppercase font-black tracking-[0.2em] text-slate-600 mb-2">
                                        {sec.label}
                                    </p>
                                    <div className="grid gap-0.5">
                                        {sec.items.map((item) => (
                                            <NavLink key={item.href} item={item} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="px-4">
                        <p className="px-4 text-[9px] uppercase font-black tracking-[0.2em] text-slate-600 mb-3">
                            Main Menu
                        </p>
                        <div className="grid gap-0.5">
                            {(role === "DRIVER"
                                ? driverItems
                                : role === "APPROVER"
                                    ? approverItems
                                    : staffItems
                            ).map((item) => (
                                <NavLink key={item.href} item={item} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
                <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent h-11 rounded-xl font-semibold"
                >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
