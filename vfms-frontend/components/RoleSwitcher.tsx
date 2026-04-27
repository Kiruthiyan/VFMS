"use client";

import { useState, useRef, useEffect } from "react";
import { useRole, User } from "@/lib/roleContext";
import { ChevronDown, Loader2, Check } from "lucide-react";

const ROLE_CONFIG: Record<string, {
    label: string;
    active: string;
    idle: string;
    dot: string;
    dropdown: string;
}> = {
    SYSTEM_USER: {
        label:    "Users",
        active:   "bg-blue-700 text-white border-blue-700",
        idle:     "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        dot:      "bg-blue-500",
        dropdown: "text-blue-700",
    },
    STAFF: {
        label:    "Staff",
        active:   "bg-amber-600 text-white border-amber-600",
        idle:     "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        dot:      "bg-amber-500",
        dropdown: "text-amber-700",
    },
    DRIVER: {
        label:    "Drivers",
        active:   "bg-green-600 text-white border-green-600",
        idle:     "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        dot:      "bg-green-500",
        dropdown: "text-green-700",
    },
    ADMIN: {
        label:    "Admin",
        active:   "bg-purple-700 text-white border-purple-700",
        idle:     "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        dot:      "bg-purple-500",
        dropdown: "text-purple-700",
    },
};

const ROLE_ORDER = ["SYSTEM_USER", "STAFF", "DRIVER", "ADMIN"];

interface RoleGroupProps {
    role: string;
    users: User[];
    currentUser: User;
    onSelect: (user: User) => void;
    isLoading?: boolean;
}

function RoleGroup({ role, users, currentUser, onSelect, isLoading }: RoleGroupProps) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const config = ROLE_CONFIG[role];
    const isActiveRole = currentUser.role === role;
    const activeUser = users.find(u => u.id === currentUser.id);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (user: User) => {
        onSelect(user);
        setOpen(false);
    };

    const buttonLabel = isActiveRole && activeUser
        ? `${activeUser.name}`
        : config.label;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen(prev => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    isActiveRole ? config.active : config.idle
                }`}
            >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActiveRole ? "bg-white/80" : config.dot}`} />
                <span>{buttonLabel}</span>
                {isLoading
                    ? <Loader2 className="h-3 w-3 animate-spin ml-1" />
                    : <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
                }
            </button>

            {open && !isLoading && (
                <div className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 min-w-[200px] py-1 overflow-hidden">
                    <p className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 ${config.dropdown}`}>
                        {config.label}
                    </p>
                    {users.length === 0 ? (
                        <p className="text-xs text-slate-400 px-3 py-2">No {config.label.toLowerCase()} found</p>
                    ) : (
                        users.map(user => {
                            const isSelected = user.id === currentUser.id;
                            return (
                                <button
                                    key={user.id}
                                    onClick={() => handleSelect(user)}
                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                                        isSelected
                                            ? "bg-slate-50 font-semibold"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <div>
                                        <p className={`font-semibold ${isSelected ? config.dropdown : ""}`}>
                                            {user.name}
                                        </p>
                                        {user.employeeId && (
                                            <p className="text-slate-400 text-[10px] mt-0.5">{user.employeeId}</p>
                                        )}
                                        <p className="text-slate-400 text-[10px]">
                                            {role.replace("_", " ")}
                                        </p>
                                    </div>
                                    {isSelected && <Check className={`h-3.5 w-3.5 shrink-0 ${config.dropdown}`} />}
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}

export default function RoleSwitcher() {
    const { currentUser, setCurrentUser, fixedUsers, drivers, driversLoading } = useRole();

    const groupedUsers: Record<string, User[]> = {
        SYSTEM_USER: fixedUsers.filter(u => u.role === "SYSTEM_USER"),
        STAFF:       fixedUsers.filter(u => u.role === "STAFF"),
        DRIVER:      drivers,
        ADMIN:       fixedUsers.filter(u => u.role === "ADMIN"),
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Switch Role — Testing Only
            </p>
            <div className="flex flex-wrap gap-2">
                {ROLE_ORDER.map(role => (
                    <RoleGroup
                        key={role}
                        role={role}
                        users={groupedUsers[role]}
                        currentUser={currentUser}
                        onSelect={setCurrentUser}
                        isLoading={role === "DRIVER" && driversLoading}
                    />
                ))}
            </div>
        </div>
    );
}
