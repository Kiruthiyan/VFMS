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

export type UserRole = "SYSTEM_USER" | "APPROVER" | "DRIVER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  employeeId?: string;
}

interface RoleContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  fixedUsers: User[];
  drivers: User[];
  driversLoading: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

function mapAuthUserToTripUser(
  userId: string,
  fullName: string,
  role: string
): User {
  return {
    id: userId,
    name: fullName,
    role: role as UserRole,
  };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const authUser = useAuthStore((state) => state.user);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

  // currentUser is always derived from the auth store — no manual switching
  const currentUser = useMemo<User>(() => {
    if (!authUser) {
      return { id: "anonymous", name: "Guest", role: "SYSTEM_USER" as UserRole };
    }
    return mapAuthUserToTripUser(authUser.userId, authUser.fullName, authUser.role);
  }, [authUser]);

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

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser: () => {}, // no-op: role is read-only from auth store
        fixedUsers,
        drivers,
        driversLoading,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
