"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";

export type UserRole = "SYSTEM_USER" | "STAFF" | "DRIVER" | "ADMIN";

export interface User {
    id: string;
    name: string;
    role: UserRole;
    employeeId?: string;
}

// Fixed non-driver users (hardcoded test accounts)
const FIXED_USERS: User[] = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Niruthigan", role: "SYSTEM_USER" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Kavishanth (Staff)", role: "STAFF" },
    { id: "00000000-0000-0000-0000-000000000005", name: "Admin", role: "ADMIN" },
];

interface RoleContextType {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    fixedUsers: User[];
    drivers: User[];
    driversLoading: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User>(FIXED_USERS[0]);
    const [drivers, setDrivers] = useState<User[]>([]);
    const [driversLoading, setDriversLoading] = useState(true);

    useEffect(() => {
        api.get("/trips/all-drivers")
            .then(res => {
                const driverUsers: User[] = res.data.map((d: {
                    id: string;
                    firstName: string;
                    lastName: string;
                    employeeId: string;
                }) => ({
                    id: d.id,
                    name: `${d.firstName} ${d.lastName}`,
                    role: "DRIVER" as UserRole,
                    employeeId: d.employeeId,
                }));
                setDrivers(driverUsers);
            })
            .catch(() => setDrivers([]))
            .finally(() => setDriversLoading(false));
    }, []);

    return (
        <RoleContext.Provider value={{
            currentUser,
            setCurrentUser,
            fixedUsers: FIXED_USERS,
            drivers,
            driversLoading,
        }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error("useRole must be used within RoleProvider");
    return ctx;
}
