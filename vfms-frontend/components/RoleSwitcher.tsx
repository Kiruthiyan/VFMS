"use client";

import { useState } from "react";
import { useRole } from "@/lib/roleContext";
import { Users, ChevronDown } from "lucide-react";

export default function RoleSwitcher() {
    const { currentUser, setCurrentUser, testUsers } = useRole();
    const [open, setOpen] = useState(false);

    const roleColors: Record<string, string> = {
        SYSTEM_USER: "bg-blue-50 text-blue-700 border-blue-200",
        STAFF: "bg-amber-50 text-amber-700 border-amber-200",
        DRIVER: "bg-green-50 text-green-700 border-green-200",
        ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl shadow-md px-3 py-2 hover:border-slate-300 transition-all"
            >
                <div className="w-6 h-6 rounded-full bg-blue-950 flex items-center justify-center">
                    <Users className="h-3 w-3 text-white" />
                </div>
                <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 leading-none">
                        {currentUser.name.split(' ')[0]}
                    </div>
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border mt-0.5 inline-block ${roleColors[currentUser.role]}`}>
                        {currentUser.role.replace('_', ' ')}
                    </div>
                </div>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 min-w-[220px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                        Switch Role
                    </p>
                    {testUsers.map(user => (
                        <button
                            key={user.id}
                            onClick={() => { setCurrentUser(user); setOpen(false); }}
                            className={`
                                w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between
                                ${currentUser.id === user.id
                                    ? "bg-blue-950 text-white"
                                    : "hover:bg-slate-50 text-slate-700"
                                }
                            `}
                        >
                            <span>{user.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                currentUser.id === user.id
                                    ? "bg-white/20 text-white"
                                    : roleColors[user.role]
                                } border`}>
                                {user.role.replace('_', ' ')}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}