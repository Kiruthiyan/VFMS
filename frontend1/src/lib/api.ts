import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { AUTH_ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

const PUBLIC_AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/logout",
  "/api/auth/staff/email-check",
  "/api/auth/staff/verify",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
  "/api/auth/send-otp",
  "/api/auth/verify-otp",
];

function isPublicAuthPath(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  const path = url.startsWith("http") ? new URL(url).pathname : url.split("?")[0];
  return PUBLIC_AUTH_PATHS.some(
    (publicPath) => path === publicPath || path.endsWith(publicPath)
  );
}

function clearSessionAndRedirectToLogin(): void {
  useAuthStore.getState().clearAuth();

  if (typeof window !== "undefined") {
    const loginPath = AUTH_ROUTES.LOGIN;
    if (!window.location.pathname.startsWith(loginPath)) {
      window.location.href = loginPath;
    }
  }
}

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<{
      success: boolean;
      data: {
        accessToken: string;
        refreshToken: string;
        userId: string;
        fullName: string;
        email: string;
        role: string;
        status: string;
        passwordChangeRequired?: boolean;
      };
    }>(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });

    const authData = response.data.data;
    useAuthStore.getState().setAuth({
      userId: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role as import("@/lib/auth").UserRole,
      status: authData.status as import("@/lib/auth").UserStatus,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      passwordChangeRequired: authData.passwordChangeRequired,
    });

    return authData.accessToken;
  } catch {
    return null;
  }
}

api.interceptors.request.use(
  (config) => {
    if (isPublicAuthPath(config.url)) {
      return config;
    }

    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isPublicAuthPath(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    if (!newToken) {
      clearSessionAndRedirectToLogin();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

export default api;

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      (error.response?.data as { message?: string })?.message ??
      error.message ??
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
