"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Role = "ADMIN" | "SYSTEM_USER" | "APPROVER" | "DRIVER";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isSystemUser: boolean;
  isApprover: boolean;
  isDriver: boolean;
  canCreate: boolean; // ADMIN, SYSTEM_USER
  canApprove: boolean; // ADMIN, APPROVER
  canAdmin: boolean; // ADMIN only
}

const RoleContext = createContext<RoleContextType>({
  role: "ADMIN",
  setRole: () => {},
  isAdmin: true,
  isSystemUser: false,
  isApprover: false,
  isDriver: false,
  canCreate: true,
  canApprove: true,
  canAdmin: true,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("ADMIN");

  useEffect(() => {
    const saved = localStorage.getItem("demo_role") as Role;
    if (saved) setRoleState(saved);
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    localStorage.setItem("demo_role", r);
  };

  const value: RoleContextType = {
    role,
    setRole,
    isAdmin: role === "ADMIN",
    isSystemUser: role === "SYSTEM_USER",
    isApprover: role === "APPROVER",
    isDriver: role === "DRIVER",
    canCreate: role === "ADMIN" || role === "SYSTEM_USER",
    canApprove: role === "ADMIN" || role === "APPROVER",
    canAdmin: role === "ADMIN",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
