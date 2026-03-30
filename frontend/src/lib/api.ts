import axios, { AxiosError, AxiosRequestConfig } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor
// NOTE: Token injection will be added by feature/auth-login (Kiruthiyan)
api.interceptors.request.use(
  (config) => {
    // Auth token will be added here when feature/auth-login is merged
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Redirect to login — handled by middleware (feature/auth-rbac)
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> {
  try {
    const method = options?.method ?? "GET";
    const headers = options?.headers as Record<string, string> | undefined;

    let data: unknown = undefined;
    if (options?.body) {
      try {
        data = JSON.parse(options.body as string);
      } catch {
        data = options.body;
      }
    }

    const response = await api.request<T>({
      url: path,
      method,
      headers,
      data,
    } as AxiosRequestConfig);

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

// Helper to extract error message from API response
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