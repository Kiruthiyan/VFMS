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

/**
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