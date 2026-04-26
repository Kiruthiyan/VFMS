import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Configured Axios instance with JWT token injection interceptor
 * Automatically adds Authorization header from auth store for all requests
 * 
 * @example
 * const response = await api.post('/auth/login', credentials);
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

<<<<<<< HEAD
/**
<<<<<<< HEAD
 * Request interceptor.
 *
 * Authentication tokens are injected at the Next.js middleware layer
 * (see middleware.ts), so no additional token handling is needed here.
 * The interceptor is kept for future extensibility (e.g., adding
 * request-level logging or correlation IDs).
 */
api.interceptors.request.use(
  (config) => {
=======
 * Request interceptor: Injects JWT token from auth store into Authorization header
 * Allows seamless authenticated API calls across the application
 */
api.interceptors.request.use(
  (config) => {
    // Get current token from auth store
    const token = useAuthStore.getState().accessToken;
    
    // Inject token if available
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
>>>>>>> origin/feature/user-auth
=======
function resolveAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("auth-store");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { accessToken?: string; state?: { accessToken?: string } };
    return parsed.accessToken ?? parsed.state?.accessToken ?? null;
  } catch {
    return null;
  }
}

// Request interceptor: inject Bearer token when available
api.interceptors.request.use(
  (config) => {
    const token = resolveAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }
>>>>>>> origin/feature/user-management
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