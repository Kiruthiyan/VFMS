import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse, UserRole, UserStatus } from "@/lib/api/auth";
import { setAuthCookies, clearAuthCookies } from "@/lib/rbac";

/**
 * Authenticated user information
 * @interface AuthUser
 * @property userId - Unique user identifier
 * @property fullName - User's full name
 * @property email - User's email address
 * @property role - User's role (ADMIN, APPROVER, STAFF, DRIVER)
 * @property status - User's account status (PENDING, APPROVED, REJECTED, DISABLED)
 */
interface AuthUser {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Authentication state store
 * @interface AuthState
 * @property user - Currently authenticated user or null
 * @property accessToken - JWT access token for API authentication
 * @property refreshToken - JWT refresh token for token renewal
 * @property setAuth - Function to set authentication state
 * @property clearAuth - Function to clear authentication state
 * @property isAuthenticated - Function to check if user is authenticated
 */
interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (data: AuthResponse) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Zustand authentication store with localStorage persistence
 * Stores user info and tokens, syncs to cookies for middleware access
 * 
 * @example
 * const { user, accessToken, setAuth, clearAuth } = useAuthStore();
 * 
 * @returns {AuthState} Authentication store state and actions
 */
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
        // Sync to cookies so middleware can read them
        setAuthCookies(data.accessToken, data.role);
      },

      clearAuth: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        clearAuthCookies();
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
