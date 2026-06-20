import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { AUTH_ROUTES } from "@/lib/constants/routes";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/** API root with `/api` suffix (e.g. report export URLs). */
export function resolveApiBaseUrl(): string {
  const root = API_BASE_URL.replace(/\/$/, "");
  return root.endsWith("/api") ? root : `${root}/api`;
}

export function resolveBackendAssetUrl(pathOrUrl: string): string {
  if (!pathOrUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return encodeURI(pathOrUrl);
  }

  const root = API_BASE_URL.replace(/\/$/, "");
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return encodeURI(`${root}${path}`);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

type ApiFetchOptions = Omit<Parameters<typeof api.request>[0], "url" | "method" | "data"> & {
  method?: string;
  body?: unknown;
};

export async function apiFetch<T>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, ...requestOptions } = options;
  const response = await api.request<T>({
    url,
    ...requestOptions,
    data: body,
    method: requestOptions.method ?? "GET",
  });

  return response.data;
}

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
    if (config.url && !config.url.startsWith("/api") && !config.url.startsWith("http") && !config.url.startsWith("/uploads")) {
      config.url = `/api${config.url.startsWith("/") ? "" : "/"}${config.url}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

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

function extractErrorMessageFromData(data: unknown): string | undefined {
  if (!data || typeof data !== "object") {
    return undefined;
  }

  const payload = data as {
    message?: unknown;
    errors?: unknown;
  };

  if (typeof payload.message === "string" && payload.message.trim().length > 0) {
    return payload.message;
  }

  if (payload.errors && typeof payload.errors === "object") {
    const firstError = Object.values(payload.errors as Record<string, unknown>).find(
      (value) => typeof value === "string" && value.trim().length > 0
    );

    if (typeof firstError === "string") {
      return firstError;
    }
  }

  return undefined;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const serverMessage = extractErrorMessageFromData(error.response?.data);
    if (serverMessage) {
      return serverMessage;
    }

    return (
      error.message ??
      "Something went wrong"
    );
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}
