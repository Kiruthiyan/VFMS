"use client";

import { useRole } from "@/lib/roleContext";
import { Users } from "lucide-react";

export default function RoleSwitcher() {
    const { currentUser, setCurrentUser, testUsers } = useRole();

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-950" />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Role Switcher
                </span>
            </div>
            <div className="space-y-1">
                {testUsers.map(user => (
                    <button
                        key={user.id}
                        onClick={() => setCurrentUser(user)}
                        className={`
                            w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all
                            ${currentUser.id === user.id
                                ? "bg-blue-950 text-white"
                                : "hover:bg-slate-50 text-slate-700"
                            }
                        `}
                    >
                        {user.name}
                        <span className={`ml-1 text-[10px] ${currentUser.id === user.id ? "text-blue-200" : "text-slate-400"}`}>
                            ({user.role})
                        </span>
                    </button>
                ))}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-[10px] text-slate-400">
                    Switch roles to test different views
                </p>
            </div>
        </div>
    );
}