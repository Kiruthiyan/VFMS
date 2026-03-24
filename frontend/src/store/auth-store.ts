import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserRole, UserStatus } from "@/lib/api/auth";

interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (data: AuthResponse) => {
        set({
          user: {
            userId: data.userId,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
            status: data.status,
          },
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => {
        return (
          !!get().accessToken &&
          get().user?.status === "APPROVED"
        );
      },
    }),
    {
      name: "vfms-auth",
    }
  )
);
