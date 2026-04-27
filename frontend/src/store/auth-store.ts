import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AuthResponse } from "@/lib/api/auth";
import type { UserRole, UserStatus } from "@/lib/auth";
import { clearAuthCookies, setAuthCookies } from "@/lib/rbac";

interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface AuthState {
  hydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setHydrated: (hydrated: boolean) => void;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      setHydrated: (hydrated) => set({ hydrated }),

      setAuth: (data: AuthResponse) => {
        set({
          hydrated: true,
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
        setAuthCookies(data.accessToken, data.role);
      },

      clearAuth: () => {
        set({
          hydrated: true,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
        clearAuthCookies();
      },

      isAuthenticated: () =>
        !!get().accessToken && get().user?.status === "APPROVED",
    }),
    {
      name: "vfms-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
