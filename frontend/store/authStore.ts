import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'ADMIN' | 'APPROVER' | 'STAFF' | 'DRIVER';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User, token: string, refreshToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        const { api } = await import('@/lib/api');
        const response = await api.post('/auth/login', { email, password });
        set({
          user: {
            ...response.user,
            id: String(response.user.id), // Convert to string
          },
          token: response.accessToken,
          refreshToken: response.refreshToken,
          isAuthenticated: true,
        });
      },
      signup: async (name: string, email: string, password: string) => {
        const { api } = await import('@/lib/api');
        await api.post('/auth/signup', { name, email, password });
      },
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      setAuth: (user: User, token: string, refreshToken: string) => {
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

