"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";

import api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export type Role = "ADMIN" | "SYSTEM_USER" | "APPROVER" | "DRIVER";
export type UserRole = Role;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

const DEMO_ROLE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEMO_ROLE === "true";

const VALID_ROLES: Role[] = ["ADMIN", "SYSTEM_USER", "APPROVER", "DRIVER"];

function isValidRole(value: string): value is Role {
  return VALID_ROLES.includes(value as Role);
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  fixedUsers: User[];
  drivers: User[];
  driversLoading: boolean;
  isAdmin: boolean;
  isSystemUser: boolean;
  isApprover: boolean;
  isDriver: boolean;
  canCreate: boolean;
  canApprove: boolean;
  canAdmin: boolean;
}

function mapAuthUserToTripUser(
  userId: string,
  fullName: string,
  role: string
): User {
  return {
    id: userId,
    name: fullName,
    role: isValidRole(role) ? role : "SYSTEM_USER",
  };
}

function buildPermissionContext(role: Role) {
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

const defaultUser: User = {
  id: "anonymous",
  name: "Guest",
  role: "SYSTEM_USER",
};

const defaultContext: RoleContextType = {
  ...buildPermissionContext("SYSTEM_USER"),
  currentUser: defaultUser,
  setCurrentUser: () => {},
  fixedUsers: [],
  drivers: [],
  driversLoading: false,
};

const RoleContext = createContext<RoleContextType>(defaultContext);

export function RoleProvider({ children }: { children: ReactNode }) {
  const authUser = useAuthStore((state) => state.user);
  const [demoRole, setDemoRoleState] = useState<Role | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

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

  const currentUser = useMemo<User>(() => {
    if (!authUser) {
      return defaultUser;
    }

    return mapAuthUserToTripUser(
      authUser.userId,
      authUser.fullName,
      effectiveRole
    );
  }, [authUser, effectiveRole]);

  const fixedUsers = authUser ? [currentUser] : [];

  useEffect(() => {
    api
      .get("/trips/all-drivers")
      .then((res) => {
        const driverUsers: User[] = res.data.map(
          (d: {
            id: string;
            firstName: string;
            lastName: string;
            employeeId: string;
          }) => ({
            id: d.id,
            name: `${d.firstName} ${d.lastName}`,
            role: "DRIVER" as UserRole,
            employeeId: d.employeeId,
          })
        );
        setDrivers(driverUsers);
      })
      .catch(() => setDrivers([]))
      .finally(() => setDriversLoading(false));
  }, []);

  const value: RoleContextType = {
    ...buildPermissionContext(effectiveRole),
    setRole,
    currentUser,
    setCurrentUser: () => {},
    fixedUsers,
    drivers,
    driversLoading,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  return useContext(RoleContext);
}
