"use client";

import { ReactNode } from "react";
import { RoleProvider } from "@/lib/trip-role-context";

export default function TripsLayout({ children }: { children: ReactNode }) {
    return <RoleProvider>{children}</RoleProvider>;
}
