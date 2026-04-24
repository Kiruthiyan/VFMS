"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "SYSTEM_USER" | "STAFF" | "DRIVER" | "ADMIN";

interface User {
    id: string;
    name: string;
    role: UserRole;
}

const TEST_USERS: User[] = [
    { id: "00000000-0000-0000-0000-000000000001", name: "Niruthigan (System User)", role: "SYSTEM_USER" },
    { id: "00000000-0000-0000-0000-000000000002", name: "Kavishanth (Staff)", role: "STAFF" },
    { id: "00000000-0000-0000-0000-000000000004", name: "Driver Raj (Driver)", role: "DRIVER" },
    { id: "00000000-0000-0000-0000-000000000005", name: "Admin (Admin)", role: "ADMIN" },
];

interface RoleContextType {
    currentUser: User;
    setCurrentUser: (user: User) => void;
    testUsers: User[];
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User>(TEST_USERS[0]);

    return (
        <RoleContext.Provider value={{ currentUser, setCurrentUser, testUsers: TEST_USERS }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    const ctx = useContext(RoleContext);
    if (!ctx) throw new Error("useRole must be used within RoleProvider");
    return ctx;
}