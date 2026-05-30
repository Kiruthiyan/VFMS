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

export type UserRole = "SYSTEM_USER" | "STAFF" | "DRIVER" | "ADMIN";

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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [driversLoading, setDriversLoading] = useState(true);

  const sessionUser = useMemo(() => {
    if (!authUser) {
      return null;
    }

    return mapAuthUserToTripUser(
      authUser.userId,
      authUser.fullName,
      authUser.role
    );
  }, [authUser]);

  const currentUser =
    selectedUser ??
    sessionUser ?? {
      id: "anonymous",
      name: "Guest",
      role: "SYSTEM_USER" as UserRole,
    };

  const fixedUsers = sessionUser ? [sessionUser] : [];

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

  useEffect(() => {
    setSelectedUser(null);
  }, [authUser?.userId]);

  return (
    <RoleContext.Provider
      value={{
        currentUser,
        setCurrentUser: setSelectedUser,
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
