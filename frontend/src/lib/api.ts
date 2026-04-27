import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import type { UserRole, UserStatus } from "@/lib/auth";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

interface PersistedAuthState {
  accessToken?: string;
  refreshToken?: string;
  state?: {
    accessToken?: string;
    refreshToken?: string;
  };
}

interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthRefreshResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

function readPersistedAuth(): PersistedAuthState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("vfms-auth");
    return raw ? (JSON.parse(raw) as PersistedAuthState) : null;
  } catch {
    return null;
  }
}

function resolveTokens(): AuthTokens {
  const store = useAuthStore.getState();
  const persisted = readPersistedAuth();

  return {
    accessToken:
      store.accessToken ??
      persisted?.state?.accessToken ??
      persisted?.accessToken ??
      null,
    refreshToken:
      store.refreshToken ??
      persisted?.state?.refreshToken ??
      persisted?.refreshToken ??
      null,
  };
}

function resolveAccessToken(): string | null {
  return resolveTokens().accessToken;
}

function shouldSkipRefresh(config?: InternalAxiosRequestConfig): boolean {
  const url = config?.url ?? "";
  return url.includes("/api/auth/login") || url.includes("/api/auth/refresh");
}

function redirectToLogin(): void {
  useAuthStore.getState().clearAuth();

  if (
    typeof window !== "undefined" &&
    window.location.pathname !== "/auth/login"
  ) {
    window.location.replace("/auth/login");
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = resolveTokens();

  if (!refreshToken) {
    redirectToLogin();
    return null;
  }

  try {
    const response = await axios.post<ApiEnvelope<AuthRefreshResponse>>(
      `${API_BASE_URL}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 15000,
      }
    );

    const refreshedAuth = response.data.data;
    useAuthStore.getState().setAuth(refreshedAuth);
    return refreshedAuth.accessToken;
  } catch {
    redirectToLogin();
    return null;
  }
}

api.interceptors.request.use(
  (config) => {
    const token = resolveAccessToken();

    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest)
    ) {
      if (error.response?.status === 401 && shouldSkipRefresh(originalRequest)) {
        useAuthStore.getState().clearAuth();
      }

      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    (originalRequest.headers as Record<string, string>).Authorization =
      `Bearer ${newAccessToken}`;

    return api(originalRequest);
  }
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Something went wrong"
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
