import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthResponse } from "@/lib/api/auth";

interface AuthState {
  user: Omit<AuthResponse, "accessToken" | "refreshToken"> | null;
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
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: {
            email: data.email,
            fullName: data.fullName,
            role: data.role,
          },
        });
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },

      isAuthenticated: () => {
        return !!get().accessToken;
      },
    }),
    {
      name: "vfms-auth",
    }
  )
);