import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getMeApi, AuthApiError, type AuthResponse } from "@/lib/api/auth";
import type { UserRole, UserStatus } from "@/lib/auth";
import { clearAuthCookies, setAuthCookies } from "@/lib/rbac";

interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  passwordChangeRequired?: boolean;
}

interface AuthState {
  hydrated: boolean;
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setHydrated: (hydrated: boolean) => void;
  setAuth: (data: AuthResponse) => void;
  syncSessionFromServer: () => Promise<void>;
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
            passwordChangeRequired: data.passwordChangeRequired,
          },
          accessToken: data.accessToken ?? null,
          refreshToken: data.refreshToken ?? null,
        });
        if (data.accessToken) {
          setAuthCookies(data.accessToken, data.role);
        }
      },

      syncSessionFromServer: async () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken) {
          set({ hydrated: true });
          return;
        }

        try {
          const profile = await getMeApi();
          set({
            hydrated: true,
            user: {
              userId: profile.userId,
              fullName: profile.fullName,
              email: profile.email,
              role: profile.role,
              status: profile.status,
              passwordChangeRequired: profile.passwordChangeRequired,
            },
            accessToken: profile.accessToken ?? accessToken,
            refreshToken: profile.refreshToken ?? refreshToken,
          });

          const nextAccessToken = profile.accessToken ?? accessToken;
          if (nextAccessToken) {
            setAuthCookies(nextAccessToken, profile.role);
          }
        } catch (error) {
          const unauthorized =
            (error instanceof AuthApiError && error.status === 401) ||
            (typeof error === "object" &&
              error !== null &&
              "status" in error &&
              (error as { status?: number }).status === 401);

          if (unauthorized) {
            get().clearAuth();
          } else {
            set({ hydrated: true });
          }
        }
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
        void state?.syncSessionFromServer();
      },
    }
  )
);
