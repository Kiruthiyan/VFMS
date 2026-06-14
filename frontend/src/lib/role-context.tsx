"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import { useAuthStore } from "@/store/auth-store";

export type Role = "ADMIN" | "SYSTEM_USER" | "APPROVER" | "DRIVER";

const DEMO_ROLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_ROLE === "true";

const VALID_ROLES: Role[] = ["ADMIN", "SYSTEM_USER", "APPROVER", "DRIVER"];

function isValidRole(value: string): value is Role {
  return VALID_ROLES.includes(value as Role);
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isSystemUser: boolean;
  isApprover: boolean;
  isDriver: boolean;
  canCreate: boolean;
  canApprove: boolean;
  canAdmin: boolean;
}

function buildRoleContext(role: Role): RoleContextType {
  return {
    role,
    setRole: () => {},
    isAdmin: role === "ADMIN",
    isSystemUser: role === "SYSTEM_USER",
    isApprover: role === "APPROVER",
    isDriver: role === "DRIVER",
    canCreate: role === "ADMIN" || role === "SYSTEM_USER",
    canApprove: role === "ADMIN" || role === "APPROVER",
    canAdmin: role === "ADMIN",
  };
}

const defaultContext = buildRoleContext("SYSTEM_USER");

const RoleContext = createContext<RoleContextType>(defaultContext);

export function RoleProvider({ children }: { children: ReactNode }) {
  const authUser = useAuthStore((state) => state.user);
  const [demoRole, setDemoRoleState] = useState<Role | null>(null);

  useEffect(() => {
    if (!DEMO_ROLE_ENABLED) {
      localStorage.removeItem("demo_role");
      return;
    }

    const saved = localStorage.getItem("demo_role");
    if (saved && isValidRole(saved)) {
      setDemoRoleState(saved);
    }
  }, []);

  const setRole = (role: Role) => {
    if (!DEMO_ROLE_ENABLED) {
      return;
    }
    setDemoRoleState(role);
    localStorage.setItem("demo_role", role);
  };

  const effectiveRole: Role = useMemo(() => {
    if (authUser?.role && isValidRole(authUser.role)) {
      return authUser.role;
    }
    if (DEMO_ROLE_ENABLED && demoRole) {
      return demoRole;
    }
    return "SYSTEM_USER";
  }, [authUser, demoRole]);

  const value: RoleContextType = {
    ...buildRoleContext(effectiveRole),
    setRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
